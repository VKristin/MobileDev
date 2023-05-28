import React from 'react';
import { useState, createContext } from "react";

export const Context = createContext();

export const ImagesProvider = (prop) =>{
    const [image, setImages] = useState(new Map());

    return (
        <Context.Provider value={[image, setImages]}>
            {prop.children}
        </Context.Provider>
    )
}