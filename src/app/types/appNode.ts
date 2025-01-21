import { Node } from "@xyflow/react";
import { TaskParam, TaskType } from "./tasks";



export interface CustomNodeData{
    type: TaskType;
    inputs : Record<string,string>;
    [key : string] : any;
}

export interface CustomNode extends Node{
    data : CustomNodeData
}

export interface ParamProps{
    param : TaskParam,
    value : string,
    updateNodeParamValue : (newValue:string)=>void
}