import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { toPng } from 'html-to-image';

// Mock function for initial testing (to be replaced by API response)
const generateMockMindMapData = (concept) => {
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
  const [isRecording, setIsRecording] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setConcept(transcript);
        setIsRecording(false);
        handleSubmit(null, transcript);
      };
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }

    // Render mind map
    if (!mindMapData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 900;
    const height = 800;

    svg.attr('width', width).attr('height', height);

    const treeLayout = d3.tree().size([width - 200, height - 200]);
    const root = d3.hierarchy(mindMapData);
    treeLayout(root);

    const g = svg.append('g').attr('transform', 'translate(100, 100)');

    const color = d3.scaleOrdinal(['#3B82F6', '#60A5FA', '#93C5FD']);

    const linkGradient = svg
      .append('defs')
      .append('linearGradient')
      .attr('id', 'link-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');
    linkGradient.append('stop').attr('offset', '0%').attr('stop-color', '#BFDBFE');
    linkGradient.append('stop').attr('offset', '100%').attr('stop-color', '#3B82F6');

    g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkVertical().x((d) => d.x).y((d) => d.y))
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

    const nodes = g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    nodes
      .append('rect')
      .attr('width', (d) => (d.data.name.length * 10) + 30)
      .attr('height', 40)
      .attr('x', (d) => -(d.data.name.length * 5 + 15))
      .attr('y', -20)
      .attr('rx', 10)
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

    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'glassmorphic-shadow');
    filter
      .append('feGaussianBlur')
      .attr('in', 'SourceAlpha')
      .attr('stdDeviation', 4)
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
      .attr('slope', 0.2);
    const merge = filter.append('feMerge');
    merge.append('feMergeNode');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    nodes
      .append('text')
      .attr('dy', 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '14px')
      .attr('font-weight', '600')
      .attr('font-family', 'Inter, sans-serif')
      .text((d) => d.data.name)
      .style('text-shadow', '0 1px 2px rgba(0, 0, 0, 0.3)')
      .style('pointer-events', 'none');
  }, [mindMapData]);

  const handleSubmit = async (e, input = concept, file = selectedFile) => {
    if (e) e.preventDefault();
    if (!input.trim() && !file) return;

    try {
      const formData = new FormData();
      if (input) formData.append('concept', input);
      if (file) formData.append('file', file);

      const response = await fetch('http://localhost:8000/mindmap', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('API request failed');

      const data = await response.json();
      setMindMapData(data);
    } catch (error) {
      console.error('Error fetching mind map data:', error);
      // Fallback to mock data
      const mockData = generateMockMindMapData(input || (file ? file.name : 'Uploaded Content'));
      setMindMapData(mockData);
    } finally {
      setConcept('');
      setSelectedFile(null);
    }
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in this browser.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setIsRecording(true);
      recognitionRef.current.start();
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && (file.type.includes('pdf') || file.type.includes('image'))) {
      setSelectedFile(file);
      handleSubmit(null, '', file);
    } else {
      alert('Please upload a PDF or image file.');
    }
    e.target.value = null;
  };

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
          alert('Mind map copied to clipboard!');
        });
      } catch (err) {
        console.error('Failed to copy image:', err);
        alert('Failed to copy mind map.');
      }
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-80 h-80 bg-blue-300/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="max-w-5xl w-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_32px_rgba(0,50,100,0.15)] p-8 border border-blue-200/50 animate-scale-in">
        <h1 className="text-4xl mt-16 font-extrabold text-blue-900 mb-4 text-center tracking-tight animate-slide-in-down">
          Concept Visualizer
        </h1>
        <p className="text-blue-600 mb-8 text-center text-lg max-w-xl mx-auto animate-slide-in-up">
          Transform ideas into stunning flowchart-style mind maps using text, voice, documents, or images.
        </p>

        <div className="mb-8">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <input
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Enter a concept (e.g., Artificial Intelligence)"
              className="flex-1 p-4 bg-white/50 text-blue-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/70 transition-all duration-300 placeholder-blue-400/70 border border-blue-200/50 shadow-inner"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 ${
                  isRecording ? 'animate-pulse' : ''
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,image/*"
                className="hidden"
              />
              <button
                type="submit"
                className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-blue-500/40 transform hover:scale-105 transition-all duration-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
        </div>

        <div className="flex flex-col items-center">
          <div
            ref={containerRef}
            className="bg-white/95 rounded-xl border border-blue-200/50 p-4 shadow-lg w-full overflow-auto"
            style={{ maxHeight: '500px', width: '100%' }}
          >
            <svg
              ref={svgRef}
              className="text-blue-900"
              style={{ minHeight: '800px', width: '100%' }}
            ></svg>
          </div>
          {mindMapData && (
            <button
              onClick={copyImage}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-blue-500/40 transform hover:scale-105 transition-all duration-300"
            >
              Copy Mind Map Image
            </button>
          )}
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes slide-in-down { 0% { opacity: 0; transform: translateY(-30px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes slide-in-up { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes scale-in { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes float-delayed { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-30px); } }
        .animate-slide-in-down { animation: slide-in-down 0.8s ease-out; }
        .animate-slide-in-up { animation: slide-in-up 0.8s ease-out 0.2s both; }
        .animate-scale-in { animation: scale-in 0.8s ease-out 0.4s both; }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
      `}</style>
    </section>
  );
};

export default MindMap;