"use client";

import { TaskParam, TaskParamType } from '@/app/types/tasks'
import { Input } from '@/components/ui/input';
import React, { useCallback } from 'react'
import StringParam from './param/StringParam';
import { useReactFlow } from '@xyflow/react';
import { CustomNode } from '@/app/types/appNode';


const NodeParamField = ({param, nodeId} : {param : TaskParam, nodeId: string}) => {

    const {updateNodeData, getNode} = useReactFlow();
    const node = getNode(nodeId) as CustomNode;
    const value = node?.data.inputs?.[param.name] || ""; //providing default null value
    
    

    const updateNodeParamValue = useCallback((newValue : string)=>{
        updateNodeData(nodeId,{
            inputs : {
                ...node?.data.inputs,
                [param.name] : newValue
            },
        });
    },[nodeId, node?.data.inputs])
    

    switch(param.type){
    case TaskParamType.STRING:
        return (<StringParam param={param} value={value} updateNodeParamValue={updateNodeParamValue} />)
    default:
        return (<div className='w-full'>
            <p className='text-xs text-muted-foreground '>
                Not implemented
            </p>
        </div>);
  }
}

export default NodeParamField