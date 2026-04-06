import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.regex.*;

/**
 * Single-file Java program (JEP 330) that detects common anti-patterns in Java source.
 * Run with: java FindPatterns.java <source-file>
 */
public class FindPatterns {

    public static void main(String[] args) throws Exception {
        if (args.length == 0 || args[0].equals("--help")) {
            System.err.println("Usage: java FindPatterns.java <source-file>");
            System.exit(args.length == 0 ? 1 : 0);
            return;
        }

        Path file = Paths.get(args[0]);
        if (!Files.exists(file)) {
            System.err.println("File not found: " + args[0]);
            System.exit(1);
            return;
        }

        List<String> lines = Files.readAllLines(file);
        List<Map<String, Object>> issues = new ArrayList<>();

        for (int i = 0; i < lines.size(); i++) {
            String line = lines.get(i).trim();
            int lineNum = i + 1;

            // Empty catch blocks
            if (line.matches("\\}\\s*catch\\s*\\(.*\\)\\s*\\{\\s*\\}") ||
                (line.matches("catch\\s*\\(.*\\)\\s*\\{") && i + 1 < lines.size() && lines.get(i + 1).trim().equals("}"))) {
                issues.add(makeIssue(lineNum, "empty-catch", "error",
                    "Empty catch block swallows exceptions silently"));
            }

            // System.out.println in non-test files
            if ((line.contains("System.out.println") || line.contains("System.err.println")) &&
                !file.toString().contains("Test") && !file.toString().contains("test")) {
                issues.add(makeIssue(lineNum, "no-sysout", "warning",
                    "Use a logger instead of System.out/err.println"));
            }

            // Wildcard imports
            if (line.matches("import\\s+.*\\.\\*;")) {
                issues.add(makeIssue(lineNum, "no-wildcard-import", "warning",
                    "Avoid wildcard imports — use specific imports"));
            }

            // Magic numbers (integers > 1 not in constants)
            Matcher numMatch = Pattern.compile("(?<!\\w)(\\d{2,})(?!\\w)").matcher(line);
            while (numMatch.find()) {
                int val = Integer.parseInt(numMatch.group(1));
                if (val > 1 && !line.contains("static final") && !line.startsWith("//") && !line.startsWith("*")) {
                    issues.add(makeIssue(lineNum, "magic-number", "info",
                        "Magic number " + val + " — consider extracting to a named constant"));
                    break;
                }
            }

            // TODO/FIXME comments
            if (line.contains("TODO") || line.contains("FIXME") || line.contains("HACK")) {
                issues.add(makeIssue(lineNum, "todo-comment", "info",
                    "Unresolved TODO/FIXME/HACK comment"));
            }
        }

        int errors = 0, warnings = 0, info = 0;
        for (Map<String, Object> iss : issues) {
            switch ((String) iss.get("severity")) {
                case "error": errors++; break;
                case "warning": warnings++; break;
                case "info": info++; break;
            }
        }

        // Output JSON
        System.out.println("{");
        System.out.println("  \"file\": \"" + file + "\",");
        System.out.println("  \"issues\": [");
        for (int i = 0; i < issues.size(); i++) {
            Map<String, Object> iss = issues.get(i);
            System.out.printf("    {\"line\": %d, \"rule\": \"%s\", \"severity\": \"%s\", \"message\": \"%s\"}%s%n",
                iss.get("line"), iss.get("rule"), iss.get("severity"),
                ((String) iss.get("message")).replace("\"", "\\\""),
                i < issues.size() - 1 ? "," : "");
        }
        System.out.println("  ],");
        System.out.printf("  \"summary\": {\"errors\": %d, \"warnings\": %d, \"info\": %d}%n", errors, warnings, info);
        System.out.println("}");
    }

    static Map<String, Object> makeIssue(int line, String rule, String severity, String message) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("line", line);
        m.put("rule", rule);
        m.put("severity", severity);
        m.put("message", message);
        return m;
    }
}
