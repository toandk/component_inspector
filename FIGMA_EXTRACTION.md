# Figma Node Extraction Guide

This guide explains how to extract nodes from your Figma file and convert them to the Node structure used by this application.

## What You Need

1. **Figma URL**: `https://www.figma.com/design/45fDulQfk18qBsAsq89oI7/T%C3%ADnh-n%C4%83ng-Gapo?node-id=2-291016&t=pxTxCv36YJ4NTT3a-4`
2. **Figma Personal Access Token**: Get yours from [Figma Settings](https://www.figma.com/developers/api#access-tokens)

## Methods to Extract Figma Nodes

### Method 1: Using the Web Application

1. **Start the development server**:

   ```bash
   npm run dev
   ```

2. **Open the application** in your browser (usually `http://localhost:8080`)

3. **If no nodes are loaded**, you'll see the Figma Importer interface automatically

4. **If nodes are already loaded**, you can find the Figma Importer in the left sidebar

5. **Enter your details**:

   - Figma URL (pre-filled with your URL)
   - Figma Access Token (get from Figma Settings)

6. **Click "Import from Figma"** to fetch and convert the nodes

7. **Save or Load**:
   - Click "Save as JSON" to download the nodes as a JSON file
   - Click "Load into App" to use the nodes in the application immediately

### Method 2: Using the Command Line Script

1. **Set your Figma access token as an environment variable**:

   ```bash
   export FIGMA_ACCESS_TOKEN="your_figma_token_here"
   ```

2. **Run the extraction script**:

   ```bash
   npm run extract-figma
   ```

3. **Find the output**: The script will create `figma-nodes.json` in the project root

### Method 3: Using the Node.js Script Directly

1. **Navigate to the scripts directory**:

   ```bash
   cd scripts
   ```

2. **Run the script with your token**:
   ```bash
   FIGMA_ACCESS_TOKEN="your_token" node extract-figma.js
   ```

## Getting a Figma Access Token

1. Go to [Figma Settings](https://www.figma.com/developers/api#access-tokens)
2. Click on "Personal access tokens"
3. Click "Create new token"
4. Give it a name (e.g., "Node Extraction")
5. Copy the generated token (keep it secure!)

## What Gets Extracted

The extraction process converts Figma nodes to match the Node structure:

```typescript
type Node = {
  id: string; // Figma node ID
  x: number; // X position from absoluteBoundingBox
  y: number; // Y position from absoluteBoundingBox
  name: string; // Figma node name
  type: "Div" | "Input" | "Image" | "Button"; // Mapped from Figma type
  width: number; // Width from absoluteBoundingBox
  height: number; // Height from absoluteBoundingBox
  display?: string; // Optional display property
  text?: string; // Text content (for text nodes)
  background?: string; // Background color (from fills)
  color?: string; // Text color
  border?: string; // Border style (from strokes)
  children: Node[]; // Child nodes (recursive)
};
```

## Figma Type Mapping

The script maps Figma node types to our Node types:

| Figma Type | Mapped Type |
| ---------- | ----------- |
| FRAME      | Div         |
| GROUP      | Div         |
| RECTANGLE  | Div         |
| TEXT       | Div         |
| INSTANCE   | Button      |
| COMPONENT  | Button      |
| VECTOR     | Image       |
| ELLIPSE    | Div         |
| LINE       | Div         |
| POLYGON    | Div         |
| STAR       | Div         |
| Other      | Div         |

## Color Extraction

- **Background colors** are extracted from the first solid fill
- **Border colors** are extracted from the first solid stroke
- Colors are converted from RGB (0-1) to hex format

## Troubleshooting

### "Invalid Figma URL" Error

- Make sure your URL contains `/file/[FILE_ID]`
- The current URL format should work: `https://www.figma.com/design/45fDulQfk18qBsAsq89oI7/...`

### "Failed to fetch Figma file" Error

- Check your access token is correct
- Make sure the token has access to the file
- Verify the file is not private (or your token has access)

### "Missing properties" Errors

- Some Figma nodes might not have `absoluteBoundingBox` - defaults will be used
- Text content is only available for TEXT nodes

## Example Output

```json
{
  "id": "0:1",
  "name": "Page 1",
  "type": "Div",
  "x": 0,
  "y": 0,
  "width": 1920,
  "height": 1080,
  "background": "#ffffff",
  "children": [
    {
      "id": "1:2",
      "name": "Header",
      "type": "Div",
      "x": 0,
      "y": 0,
      "width": 1920,
      "height": 80,
      "background": "#f0f0f0",
      "children": []
    }
  ]
}
```

## Next Steps

After extracting the nodes:

1. **Load them into the application** to see the tree view and canvas preview
2. **Inspect CSS properties** using the CSS Inspector panel
3. **Identify components** - the app will automatically suggest which nodes can be components
4. **Modify and iterate** on your design structure

## File Structure

```
├── src/
│   ├── lib/
│   │   └── figma-converter.ts     # Core conversion logic
│   ├── components/
│   │   └── figma-importer/
│   │       └── index.tsx          # React component for importing
├── scripts/
│   └── extract-figma.js           # Standalone extraction script
└── figma-nodes.json               # Output file (generated)
```
