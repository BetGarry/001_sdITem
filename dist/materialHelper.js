var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { MaterialStandardData } from "@shapediver/viewer";
export const getMaterials = (node, materials = []) => {
    for (let i = 0; i < node.data.length; i++) {
        if (node.data[i] instanceof MaterialStandardData)
            materials.push(node.data[i]);
    }
    for (let i = 0; i < node.children.length; i++) {
        getMaterials(node.children[i], materials);
    }
    return materials;
};
export const changeMaterialForOutputs = (outputs, materialProperties) => {
    let materials = [];
    outputs.forEach((o) => {
        o.freeze = true;
        materials = materials.concat(getMaterials(o.node));
    });
    materials.forEach((m) => __awaiter(void 0, void 0, void 0, function* () {
        for (let p in materialProperties)
            m[p] =
                materialProperties[p];
        m.updateVersion();
    }));
};
export const changeMaterials = (session) => {
    const materialOutputs = Object.values(session.outputs).filter((o) => o.material === undefined);
    changeMaterialForOutputs([
        materialOutputs.find((o) => o.name === "GEMS"),
    ], {
        metalness: 0.75,
        roughness: 0.5,
        color: "#000000",
        clearcoat: 1,
        clearcoatRoughness: 0
    });
};
