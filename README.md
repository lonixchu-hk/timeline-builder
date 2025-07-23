# Timeline Builder

## Overview

The Timeline Builder is a JSON-based project management tool designed to help users define and visualize project timelines, stages, and tasks. It provides a structured way to organize project details, including critical tasks, types, and durations.

## Features

- Define project start and end dates.
- Configure stage-specific tasks with descriptions, types, and criticality.
- Support for multiple releases and detailed task breakdowns.
- Customizable background colors and type mappings.

## File Structure

- **sample.json**: Contains the project timeline data, including stages, tasks, and configurations.

## Usage

1. **Edit the JSON File**:

   - Modify `sample.json` to define your project timeline.
   - Add or update stages, tasks, and configurations as needed.

2. **Configuration Options**:

   - `majorBgColor`: Set the background color for major stages.
   - `typeMap`: Define color mappings for task types (e.g., API, App).

3. **Stages and Tasks**:
   - Each stage contains a list of tasks with attributes like `name`, `start`, `end`, `type`, and `isCritical`.

## Example JSON Structure

```json
{
  "basic": {
    "projectStart": "YYYY-MM-DD",
    "projectEnd": "YYYY-MM-DD"
  },
  "config": {
    "majorBgColor": "#hexcolor",
    "typeMap": {
      "Type1": "#hexcolor",
      "Type2": "#hexcolor"
    }
  },
  "stages": [
    {
      "stage": "Stage Name",
      "desc": "Description",
      "items": [
        {
          "name": "Task Name",
          "start": "YYYY-MM-DD",
          "end": "YYYY-MM-DD",
          "type": "Type",
          "isCritical": true
        }
      ]
    }
  ]
}
```

## Future Enhancements

- Add visualization tools for timeline rendering.
- Support for importing/exporting timelines in different formats.
- Refactor webpage

## License

This project is licensed under the MIT License.
