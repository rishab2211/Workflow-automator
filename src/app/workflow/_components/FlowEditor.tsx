"use client";
import { Workflow } from "@prisma/client";
import {
  addEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  getOutgoers,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import React, { useCallback, useEffect } from "react";
import "@xyflow/react/dist/style.css";
import { CreateFlowNode } from "@/lib/workflow/createFlowNode";
import { TaskType } from "@/app/types/tasks";
import NodeComponent from "./nodes/NodeComponent";
import { CustomNode } from "@/app/types/appNode";
import DeletableEdge from "./edges/DeletableEdge";
import { error } from "console";
import { TaskRegistry } from "@/lib/workflow/task/Registry";

const nodeTypes = {
  Node: NodeComponent,
};

const edgeTypes = {
  default: DeletableEdge,
};

const snapGrid: [number, number] = [1, 1];

const FlowEditor = ({ workflow }: { workflow: Workflow }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { setViewport, screenToFlowPosition, updateNodeData } = useReactFlow();

  useEffect(() => {
    try {
      const flow = JSON.parse(workflow.definition);
      if (!flow) {
        return;
      }

      setNodes(flow.nodes || []);
      setEdges(flow.edges || []);

      if (!flow.viewport) return;
      const { x = 0, y = 0, zoom = 1 } = flow.viewport;
      setViewport({ x, y, zoom });
    } catch (err) {
      console.log(err);
    }
  }, [workflow.definition, setEdges, setNodes, setViewport]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const taskType = event.dataTransfer.getData("application/reactflow");

      if (typeof taskType === undefined || !taskType) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = CreateFlowNode(taskType as TaskType, position);
      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      console.dir(connection, { depth: null });
      setEdges((eds) => addEdge({ ...connection, animated: true }, eds));
      if (!connection.targetHandle) return;
      // Remove inout value if present on connection
      const node = nodes.find((nd) => nd.id === connection.target);
      if (!node) {
        return;
      }

      const nodeInputs = node.data.inputs;
      delete nodeInputs[connection.targetHandle];
      updateNodeData(node.id, { inputs: nodeInputs });
    },
    [setEdges, updateNodeData, nodes]
  );

  const isValidConnection = useCallback((connection: Edge | Connection) => {
    // No self-connection allowed
    if (connection.source === connection.target) {
      return false;
    }
    // Same taskParam type connection
    const sourceNode = nodes.find((node) => node.id === connection.source);
    const targetNode = nodes.find((node) => node.id === connection.target);
    if (!sourceNode || !targetNode) {
      console.error("Invalid connection : source or target node not found");
      return false;
    }
    const sourceTask = TaskRegistry[sourceNode.data.type];
    const targetTask = TaskRegistry[targetNode.data.type];

    const output = sourceTask.outputs.find(
      (o)=>o.name === connection.sourceHandle
    );

    const input = targetTask.inputs.find(
      (i)=>i.name === connection.targetHandle
    );

    if(input?.type !== output?.type){
      console.error("Invalid connection : type mismatch");
      return false;
    }

    // Preventing Cycles
    const hasCycle = (node : CustomNode, visited = new Set()) => {
      if(visited.has(node.id)) return false;

      visited.add(node.id);

      for(const outgoer of getOutgoers(node,nodes,edges) ){
        if(outgoer.id === connection.source) return true;
        if(hasCycle(outgoer, visited)) return true;
      }

    };
    
    const detectedCycle = hasCycle(targetNode);
    return !detectedCycle;
  }, [nodes, edges]);

  return (
    <div className="h-screen w-screen ">
      <main className=" h-full w-full ">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          snapToGrid={true}
          snapGrid={snapGrid}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
        >
          <Controls position="top-left" className="" />
          <Background variant={BackgroundVariant.Dots} />
        </ReactFlow>
      </main>
    </div>
  );
};

export default FlowEditor;
