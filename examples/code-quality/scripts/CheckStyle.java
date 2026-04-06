import java.io.*;
import java.nio.file.*;
import java.util.*;
import java.util.stream.*;

/**
 * Single-file Java program (JEP 330) that checks Java source files for style issues.
 * Run with: java CheckStyle.java <file-or-directory> [--rules <rules.json>]
 */
public class CheckStyle {

    static int maxLineLength = 120;
    static int maxMethodLength = 50;
    static int maxFileLength = 500;

    public static void main(String[] args) throws Exception {
        if (args.length == 0 || args[0].equals("--help")) {
            System.err.println("Usage: java CheckStyle.java <file-or-directory> [--rules <rules.json>]");
            System.exit(args.length == 0 ? 1 : 0);
            return;
        }

        String target = args[0];
        // Parse optional --rules flag
        for (int i = 1; i < args.length - 1; i++) {
            if (args[i].equals("--rules")) {
                loadRules(args[i + 1]);
            }
        }

        Path path = Paths.get(target);
        List<Map<String, Object>> allResults = new ArrayList<>();

        if (Files.isDirectory(path)) {
            try (Stream<Path> walk = Files.walk(path)) {
                List<Path> javaFiles = walk
                    .filter(p -> p.toString().endsWith(".java"))
                    .filter(p -> !p.toString().contains("/build/"))
                    .filter(p -> !p.toString().contains("/target/"))
                    .filter(p -> !p.getFileName().toString().startsWith("."))
                    .collect(Collectors.toList());
                for (Path f : javaFiles) {
                    allResults.add(checkFile(f));
                }
            }
        } else {
            allResults.add(checkFile(path));
        }

        // Output JSON array
        System.out.println("[");
        for (int i = 0; i < allResults.size(); i++) {
            System.out.print(toJson(allResults.get(i)));
            if (i < allResults.size() - 1) System.out.println(",");
        }
        System.out.println("\n]");
    }

    static Map<String, Object> checkFile(Path file) throws IOException {
        List<String> lines = Files.readAllLines(file);
        List<Map<String, Object>> issues = new ArrayList<>();
        int methodStartLine = -1;
        int braceDepth = 0;
        boolean inMethod = false;

        for (int i = 0; i < lines.size(); i++) {
            String line = lines.get(i);
            int lineNum = i + 1;

            // Line length check
            if (line.length() > maxLineLength) {
                issues.add(issue(lineNum, "line-too-long", "warning",
                    "Line has " + line.length() + " characters (max: " + maxLineLength + ")"));
            }

            // Tab check
            if (line.contains("\t")) {
                issues.add(issue(lineNum, "no-tabs", "info", "Line contains tab characters — use spaces"));
            }

            // Trailing whitespace
            if (line.length() > 0 && line.charAt(line.length() - 1) == ' ') {
                issues.add(issue(lineNum, "trailing-whitespace", "info", "Trailing whitespace"));
            }

            // Simple method detection
            String trimmed = line.trim();
            if (trimmed.matches(".*(public|private|protected|static).*\\(.*\\).*\\{\\s*$") && !trimmed.startsWith("//")) {
                inMethod = true;
                methodStartLine = lineNum;
                braceDepth = 1;
            } else if (inMethod) {
                for (char c : line.toCharArray()) {
                    if (c == '{') braceDepth++;
                    if (c == '}') braceDepth--;
                }
                if (braceDepth <= 0) {
                    int methodLength = lineNum - methodStartLine + 1;
                    if (methodLength > maxMethodLength) {
                        issues.add(issue(methodStartLine, "method-too-long", "warning",
                            "Method has " + methodLength + " lines (max: " + maxMethodLength + ")"));
                    }
                    inMethod = false;
                }
            }
        }

        // File length check
        if (lines.size() > maxFileLength) {
            issues.add(issue(1, "file-too-long", "warning",
                "File has " + lines.size() + " lines (max: " + maxFileLength + ")"));
        }

        int errors = 0, warnings = 0, info = 0;
        for (Map<String, Object> iss : issues) {
            switch ((String) iss.get("severity")) {
                case "error": errors++; break;
                case "warning": warnings++; break;
                case "info": info++; break;
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("file", file.toString());
        result.put("issues", issues);
        Map<String, Integer> summary = new LinkedHashMap<>();
        summary.put("errors", errors);
        summary.put("warnings", warnings);
        summary.put("info", info);
        result.put("summary", summary);
        return result;
    }

    static Map<String, Object> issue(int line, String rule, String severity, String message) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("line", line);
        m.put("rule", rule);
        m.put("severity", severity);
        m.put("message", message);
        return m;
    }

    static void loadRules(String rulesPath) throws IOException {
        String content = new String(Files.readAllBytes(Paths.get(rulesPath)));
        // Simple JSON parsing for known keys
        maxLineLength = extractInt(content, "maxLineLength", maxLineLength);
        maxMethodLength = extractInt(content, "maxMethodLength", maxMethodLength);
        maxFileLength = extractInt(content, "maxFileLength", maxFileLength);
    }

    static int extractInt(String json, String key, int defaultVal) {
        int idx = json.indexOf("\"" + key + "\"");
        if (idx < 0) return defaultVal;
        int colon = json.indexOf(":", idx);
        if (colon < 0) return defaultVal;
        StringBuilder sb = new StringBuilder();
        for (int i = colon + 1; i < json.length(); i++) {
            char c = json.charAt(i);
            if (Character.isDigit(c)) sb.append(c);
            else if (sb.length() > 0) break;
        }
        return sb.length() > 0 ? Integer.parseInt(sb.toString()) : defaultVal;
    }

    static String toJson(Map<String, Object> map) {
        StringBuilder sb = new StringBuilder();
        sb.append("  {");
        int i = 0;
        for (Map.Entry<String, Object> e : map.entrySet()) {
            if (i > 0) sb.append(",");
            sb.append("\n    \"").append(e.getKey()).append("\": ");
            sb.append(valueToJson(e.getValue()));
            i++;
        }
        sb.append("\n  }");
        return sb.toString();
    }

    @SuppressWarnings("unchecked")
    static String valueToJson(Object val) {
        if (val instanceof String) return "\"" + ((String) val).replace("\"", "\\\"") + "\"";
        if (val instanceof Number) return val.toString();
        if (val instanceof List) {
            List<Object> list = (List<Object>) val;
            if (list.isEmpty()) return "[]";
            StringBuilder sb = new StringBuilder("[\n");
            for (int i = 0; i < list.size(); i++) {
                sb.append("      ");
                if (list.get(i) instanceof Map) sb.append(toJson((Map<String, Object>) list.get(i)).trim());
                else sb.append(valueToJson(list.get(i)));
                if (i < list.size() - 1) sb.append(",");
                sb.append("\n");
            }
            sb.append("    ]");
            return sb.toString();
        }
        if (val instanceof Map) return toJson((Map<String, Object>) val).trim();
        return "null";
    }
}
