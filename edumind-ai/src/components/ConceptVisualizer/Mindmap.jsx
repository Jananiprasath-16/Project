import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { toPng } from 'html-to-image';

// Mock function to process user input and generate mind map data
const generateMindMapData = (concept) => {
  return {
    name: concept || 'Core Concept',
    children: [
      { name: 'Sub-Concept 1', children: [{ name: 'Detail 1' }, { name: 'Detail 2' }] },
      { name: 'Sub-Concept 2', children: [{ name: 'Detail 3' }] },
      { name: 'Sub-Concept 3', children: [{ name: 'Detail 4' }, { name: 'Detail 5' }] },
    ],
  };
};

const MindMap = () => {
  const [concept, setConcept] = useState('');
  const [mindMapData, setMindMapData] = useState(null);
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  // Handle concept submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (concept.trim()) {
      const data = generateMindMapData(concept);
      setMindMapData(data);
    }
  };

  // Function to copy the SVG as an image
  const copyImage = async () => {
    if (svgRef.current) {
      try {
        const dataUrl = await toPng(svgRef.current, { pixelRatio: 2 });
        const img = new Image();
        img.src = dataUrl;
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          alert('Image copied to clipboard!');
        });
      } catch (err) {
        console.error('Failed to copy image:', err);
        alert('Failed to copy image.');
      }
    }
  };

  // Render flowchart mind map using D3
  useEffect(() => {
    if (!mindMapData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const width = 900;
    const height = 800; // Increased height for flowchart

    svg.attr('width', width).attr('height', height);

    // Create tree layout
    const treeLayout = d3.tree().size([width - 200, height - 200]); // Adjusted margins
    const root = d3.hierarchy(mindMapData);
    treeLayout(root);

    const g = svg.append('g').attr('transform', 'translate(100, 100)'); // Center layout

    // Color scale for variety
    const color = d3.scaleOrdinal(d3.schemePaired);

    // Links with gradient
    const linkGradient = svg
      .append('defs')
      .append('linearGradient')
      .attr('id', 'link-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');
    linkGradient.append('stop').attr('offset', '0%').attr('stop-color', '#d1d5db');
    linkGradient.append('stop').attr('offset', '100%').attr('stop-color', '#6b7280');

    g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkVertical().x((d) => d.x).y((d) => d.y)) // Vertical links for flowchart
      .attr('fill', 'none')
      .attr('stroke', 'url(#link-gradient)')
      .attr('stroke-width', 3)
      .attr('stroke-opacity', 0.8)
      .style('transition', 'stroke-opacity 0.3s ease')
      .on('mouseover', function () {
        d3.select(this).attr('stroke-opacity', 1);
      })
      .on('mouseout', function () {
        d3.select(this).attr('stroke-opacity', 0.8);
      });

    // Nodes (rectangles)
    const nodes = g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    nodes
      .append('rect')
      .attr('width', (d) => (d.data.name.length * 10) + 20) // Dynamic width based on text
      .attr('height', 40)
      .attr('x', (d) => -(d.data.name.length * 5 + 10)) // Center rectangle
      .attr('y', -20) // Center vertically
      .attr('rx', 8) // Rounded corners
      .attr('fill', (d) => color(d.depth))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('filter', 'url(#glassmorphic-shadow)')
      .style('cursor', 'pointer')
      .on('mouseover', function () {
        d3.select(this).transition().duration(200).attr('y', -24).attr('height', 48);
      })
      .on('mouseout', function () {
        d3.select(this).transition().duration(200).attr('y', -20).attr('height', 40);
      });

    // Glassmorphic shadow filter
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'glassmorphic-shadow');
    filter
      .append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 3)
      .attr('result', 'blur');
    filter
      .append('feOffset')
      .attr('in', 'blur')
      .attr('dx', 2)
      .attr('dy', 2)
      .attr('result', 'offsetBlur');
    filter
      .append('feComponentTransfer')
      .append('feFuncA')
      .attr('type', 'linear')
      .attr('slope', 0.3);
    const merge = filter.append('feMerge');
    merge.append('feMergeNode');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Text labels
    nodes
      .append('text')
      .attr('dy', 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '14px')
      .attr('font-weight', '500')
      .attr('font-family', 'Inter, sans-serif')
      .text((d) => d.data.name)
      .style('text-shadow', '0 1px 2px rgba(0, 0, 0, 0.2)')
      .style('pointer-events', 'none');
  }, [mindMapData]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center p-8">
      <div className="max-w-5xl w-full bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-gray-100/50">
        <h1 className="text-4xl mt-16 font-bold text-gray-900 mb-4 text-center tracking-tight">
          Concept Visualizer
        </h1>
        <p className="text-gray-700 mb-8 text-center text-lg max-w-xl mx-auto">
          Transform ideas into clear, colorful flowchart-style mind maps instantly.
        </p>

        <div className="mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center">
            <input
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Enter a concept (e.g., Artificial Intelligence)"
              className="flex-1 p-4 bg-white/70 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 placeholder-gray-400 border border-gray-100/50 shadow-sm"
            />
            <button
              type="submit"
              className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-blue-400/40 transform hover:scale-105"
            >
              Generate Flowchart
            </button>
          </form>
        </div>

        <div className="flex flex-col items-center">
          <div
            ref={containerRef}
            className="bg-white/95 rounded-xl border border-gray-100/50 p-4 shadow-lg w-full overflow-auto"
            style={{ maxHeight: '500px', width: '100%' }}
          >
            <svg
              ref={svgRef}
              className="bg-black text-black"
              style={{ minHeight: '1000px', width: '100%'}}
            ></svg>
          </div>
          {mindMapData && (
            <button
              onClick={copyImage}
              className="mt-4 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-blue-400/40 transform hover:scale-105"
            >
              Copy Flowchart Image
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MindMap;