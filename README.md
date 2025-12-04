# Data Formatter | 資料格式化工具

A multi-format data formatter supporting JSON, XML, YAML, CSV, and SQL formats with syntax highlighting and one-click copy functionality.

## Features

- **Multi-Format Support**: Format and beautify JSON, XML, YAML, CSV, and SQL data
- **Tab-Based Interface**: Easy switching between different format types
- **Syntax Highlighting**: Color-coded output for better readability
- **One-Click Copy**: Quickly copy formatted results to clipboard
- **CSV Table Preview**: Visual table representation for CSV data (up to 100 rows)
- **Error Detection**: Clear error messages with line/column information
- **Internationalization**: Support for Traditional Chinese and English
- **Persistent State**: Remembers your last active tab and input content
- **File Size Validation**: Handles files up to 1MB

## Tech Stack

- React 19.2.0
- TypeScript 5.x
- Vite 7.x
- i18next for internationalization
- react-syntax-highlighter for code highlighting
- js-yaml for YAML parsing
- papaparse for CSV parsing
- sql-formatter for SQL formatting

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Preview production build
npm run preview
```

## Usage

1. Select the desired format tab (JSON, XML, YAML, CSV, or SQL)
2. Paste or type your data in the input panel
3. View the formatted output with syntax highlighting
4. Click the copy button to copy the formatted result
5. Load sample data using the "Load Sample" button for testing

## License

MIT
