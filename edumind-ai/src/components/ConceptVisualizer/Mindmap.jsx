import { useState } from 'react';
import { Map, Upload, Loader } from 'lucide-react';
import Tree from 'react-d3-tree';

// Custom node component for the mind map with dynamic circle size
const CustomNode = ({ nodeDatum, toggleNode }) => {
  // Calculate circle radius based on text length
  const baseRadius = 20;
  const textLength = nodeDatum.name.length;
  const dynamicRadius = baseRadius + Math.min(textLength * 15, 35); // Increase radius with text length, max +30px
  
  // For very long text, handle it better by wrapping
  const isLongText = textLength > 15;
  
  return (
    <g onClick={toggleNode}>
      <circle 
        r={dynamicRadius} 
        fill="#ADD8E6" 
        strokeWidth={1}
        stroke="#4f46e5"
      />
      
      {isLongText ? (
        // For longer text, break into multiple lines
        <text
          fill="black"
          textAnchor="middle"
          style={{ pointerEvents: 'none', fontSize: '11px', fontWeight: '500' }}
        >
          {nodeDatum.name.split(' ').reduce((lines, word, i, arr) => {
            if (i === 0) return [[word]];
            const lastLineIndex = lines.length - 1;
            const currentLine = lines[lastLineIndex].join(' ');
            
            if ((currentLine + ' ' + word).length < 15 || (i === arr.length - 1 && lines.length === 1)) {
              lines[lastLineIndex].push(word);
            } else {
              lines.push([word]);
            }
            return lines;
          }, [[]]).map((line, i, arr) => (
            <tspan 
              key={i} 
              x="0" 
              dy={i === 0 ? `-${(arr.length - 1) * 0.6}em` : '1.2em'}
            >
              {line.join(' ')}
            </tspan>
          ))}
        </text>
      ) : (
        // For shorter text, keep it simple
        <text
          fill="black"
          strokeWidth="0.3"
          textAnchor="middle"
          dy=".3em"
          style={{ pointerEvents: 'none', fontSize: '12px', fontWeight: '500' }}
        >
          {nodeDatum.name}
        </text>
      )}
      
      {nodeDatum.attributes && Object.entries(nodeDatum.attributes).length > 0 && (
        <text fill="black" x={dynamicRadius + 10} dy="0em" style={{ fontSize: '10px' }}>
          {Object.entries(nodeDatum.attributes).map(([key, value], i) => (
            <tspan key={i} dy="1.2em" x={dynamicRadius + 10}>
              {`${key}: ${value}`}
            </tspan>
          ))}
        </text>
      )}
    </g>
  );
};

export default function MindMapGenerator() {
  const [concept, setConcept] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [mindMapData, setMindMapData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [treeTranslate, setTreeTranslate] = useState({ x: 300, y: 50 });

  // Function to transform the API response into a format compatible with react-d3-tree
  const transformDataForTree = (data) => {
    // Check if the data follows the expected structure from the backend
    if (data && data.central && data.branches) {
      // Transform from backend format to react-d3-tree format
      return {
        name: data.central,
        children: data.branches.map(branch => ({
          name: branch.name,
          children: Array.isArray(branch.children) 
            ? branch.children.map(child => transformNodeRecursive(child))
            : []
        }))
      };
    } else {
      // If the data doesn't match expected format, return simple error tree
      return {
        name: "Invalid Data Format",
        children: [
          { 
            name: "Check Console", 
            children: [] 
          }
        ]
      };
    }
  };

  // Helper function for recursive transformation
  const transformNodeRecursive = (node) => {
    return {
      name: node.name || "Unnamed",
      children: Array.isArray(node.children) 
        ? node.children.map(child => transformNodeRecursive(child))
        : []
    };
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('concept', concept);
      if (file) {
        formData.append('file', file);
      }

      const response = await fetch('http://localhost:8000/generate-mindmap', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate mind map');
      }

      const data = await response.json();
      console.log("Mind map data from backend:", data);
      setMindMapData(data);
      
      // Calculate optimal initial position based on data complexity
      const branches = data?.branches?.length || 3;
      const avgSubBranches = data?.branches?.reduce((sum, branch) => sum + (branch.children?.length || 0), 0) / branches || 2;
      
      // Adjust initial position based on the complexity
      setTreeTranslate({ 
        x: Math.max(window.innerWidth / 3, 300),
        y: 50 + (avgSubBranches > 3 ? 50 : 0)
      });
      
    } catch (err) {
      setError(err.message || 'An error occurred while generating the mind map');
      console.error("Error generating mind map:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetZoom = () => {
    const treeWrapper = document.getElementById('treeWrapper');
    if (treeWrapper) {
      const svg = treeWrapper.querySelector('svg');
      if (svg) {
        svg.setAttribute('transform', 'translate(0,0) scale(1)');
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-gradient-to-r mt-16 from-purple-700 to-blue-500 rounded-lg shadow-lg p-8 mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
          <Map className="mr-3" size={28} />
          Mind Map Generator
        </h1>
        <p className="text-white text-opacity-90">
          Enter a concept or upload a file to generate a structured mind map
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="concept" className="block text-sm font-medium text-gray-700 mb-1">
              Concept or Topic
            </label>
            <textarea
              id="concept"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Enter your concept, topic or text to analyze..."
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required={!file}
            />
          </div>

          <div className="pt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Or Upload a File (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
              <div className="space-y-2">
                <div className="flex justify-center">
                  <Upload className="text-gray-400" size={24} />
                </div>
                <p className="text-sm text-gray-500">
                  {fileName || 'PDF, TXT, or image files'}
                </p>
                <label className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-blue-600">
                    Browse files
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.txt,.png,.jpg,.jpeg"
                  />
                </label>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || (!concept && !file)}
              className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading || (!concept && !file)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin mr-2" size={18} />
                  Generating...
                </>
              ) : (
                <>
                  <Map className="mr-2" size={18} />
                  Generate Mind Map
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </form>
      </div>

      {mindMapData && (
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Map className="mr-2" size={20} />
            Generated Mind Map: {mindMapData.central || "Mind Map"}
          </h2>
          
          <div className="border border-gray-200 rounded-lg bg-gray-50" style={{ height: "600px" }}>
            <div className="w-full h-full" id="treeWrapper">
              <Tree 
                data={transformDataForTree(mindMapData)}
                orientation="vertical"
                pathFunc="step"
                collapsible={true}
                renderCustomNodeElement={CustomNode}
                translate={treeTranslate}
                separation={{ siblings: 2.5, nonSiblings: 3 }}
                zoomable={true}
                draggable={true}
                nodeSize={{ x: 200, y: 120 }}
                pathClassFunc={() => 'text-gray-800 stroke-2'}
              />
            </div>
          </div>
          
          <div className="mt-6 flex gap-4">
            <button 
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition"
              onClick={resetZoom}
            >
              Reset Zoom
            </button>
            
            <details className="flex-1">
              <summary className="cursor-pointer text-blue-600 font-medium">View Raw Data</summary>
              <div className="mt-2 border border-gray-200 rounded-lg p-4">
                <pre className="whitespace-pre-wrap overflow-auto max-h-64 text-xs">
                  {JSON.stringify(mindMapData, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        </div>
      )}
    </div>
  );
}