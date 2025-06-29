# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2024-06-30

### Added

#### Core Features
- **Basic memo management**: Add, list, and search memos with timestamp
- **Project-based organization**: Separate memos by projects
- **Tag system**: Support for `#tag` notation with Japanese and English
- **Daily log format**: Automatically organize memos by date in Markdown files
- **Interactive mode**: Add memos through interactive prompts when no content provided

#### Command Line Interface
- `jinfo [memo]` - Add memo (default action)
- `jinfo list` - List memos with various filtering options
- `jinfo search <query>` - Search memos with advanced filters
- `jinfo project` - Project management commands

#### Search and Filtering
- **Keyword search**: Case-insensitive content search
- **Tag filtering**: Search by specific tags
- **Date range filtering**: Search within specific date ranges
- **Project filtering**: Search within specific projects
- **Combined filters**: Use multiple filters simultaneously

#### Project Management
- `jinfo project list` - List all projects
- `jinfo project add <name> <path>` - Add new project
- `jinfo project default <name>` - Set default project
- Project-specific memo storage and management

#### Configuration System
- Automatic configuration file creation at `~/.jinfo/config.json`
- Project path and description management
- User preferences for date/time format and color scheme
- Default project setting

#### File Format
- **Markdown format**: Standard `.md` files for easy editing
- **Timestamp format**: `[YYYY-MM-DD HH:mm:ss]` for each memo entry
- **Daily files**: One file per day (`YYYY-MM-DD.md`)
- **UTF-8 encoding**: Full Japanese and international character support

#### Internationalization
- **Japanese support**: Full support for Japanese content and tags
- **Mixed language tags**: Support for English and Japanese tags in same memo
- **Unicode compatibility**: Proper handling of all Unicode characters

### Technical Implementation

#### Architecture
- **TypeScript**: Full TypeScript implementation with strict typing
- **ESM modules**: Modern ES module system
- **Node.js 18+**: Support for latest Node.js features
- **Cross-platform**: Windows, macOS, and Linux compatibility

#### Dependencies
- **commander**: Command-line interface framework
- **chalk**: Colored terminal output
- **inquirer**: Interactive command-line prompts
- **dayjs**: Date and time manipulation
- **fs-extra**: Enhanced file system operations

#### Development Tools
- **Vite**: Modern build tooling
- **Vitest**: Fast unit testing framework
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **TypeScript**: Static type checking

#### Testing
- **Unit tests**: Comprehensive coverage of all modules
- **Integration tests**: End-to-end CLI testing
- **Mocking**: Proper filesystem and dependency mocking
- **Cross-platform testing**: Tested on multiple operating systems

### Documentation
- **README.md**: Comprehensive usage guide with examples
- **API.md**: Complete API reference documentation
- **USAGE.md**: Detailed usage guide with practical workflows
- **CONTRIBUTING.md**: Contribution guidelines for developers

### Performance
- **Efficient file operations**: Only reads necessary files during operations
- **Memory optimization**: Streams and lazy loading for large datasets
- **Fast search**: Optimized search algorithms for quick results
- **Minimal dependencies**: Lightweight package with essential dependencies only

### Error Handling
- **Graceful error handling**: Proper error messages and recovery
- **Input validation**: Validates user input and provides helpful feedback
- **File system errors**: Handles permission and access issues gracefully
- **Configuration errors**: Automatic configuration recovery and creation

### Security
- **Path sanitization**: Prevents directory traversal attacks
- **Input sanitization**: Safe handling of user input
- **File permissions**: Respects system file permissions
- **No external network calls**: Operates entirely offline

[Unreleased]: https://github.com/yourusername/jinfo/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/yourusername/jinfo/releases/tag/v1.0.0