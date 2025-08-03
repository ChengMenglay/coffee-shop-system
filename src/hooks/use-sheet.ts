import { create } from "zustand";

interface SheetItem{
    open:boolean;
    onOpen:()=>void;
    onClose:()=>void
}

const useSheet = create<SheetItem>((set)=>({
    open:false,
    onOpen:()=>set({open:true}),
    onClose:()=>set({open:false})
}))

export default useSheet;