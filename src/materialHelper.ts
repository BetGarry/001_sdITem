import {
    TreeNode,
    MaterialStandardData,
    IOutputApi,
    ISessionApi,
    ITreeNode,
    IMaterialStandardDataProperties,
    sceneTree,
    viewports
  } from "@shapediver/viewer";
  
  export const getMaterials = (
    node: ITreeNode,
    materials: MaterialStandardData[] = []
  ): MaterialStandardData[] => {
    for (let i = 0; i < node.data.length; i++) {
      if (node.data[i] instanceof MaterialStandardData)
        materials.push(<MaterialStandardData>node.data[i]);
    }
    for (let i = 0; i < node.children.length; i++) {
      getMaterials(node.children[i], materials);
    }
  
    return materials;
  };
  
  export const changeMaterialForOutputs = (
    outputs: IOutputApi[],
    materialProperties: IMaterialStandardDataProperties
  ) => {
    let materials: MaterialStandardData[] = [];
    outputs.forEach((o: IOutputApi) => {
      o.freeze = true;
      materials = materials.concat(getMaterials(o.node!));
    });
    materials.forEach(async (m) => {
      for (let p in materialProperties)
        (<any>m)[p as keyof MaterialStandardData] =
          materialProperties[p as keyof IMaterialStandardDataProperties];
      m.updateVersion();
    });
  };
  
  
  export const changeMaterials = (session: ISessionApi) => {
    const materialOutputs = Object.values(session.outputs).filter(
      (o: IOutputApi) => o.material === undefined
    );  
    changeMaterialForOutputs(
      [
        materialOutputs.find((o: IOutputApi) => o.name === "GEMS")!,
      ],
      {
        metalness: 0.75,
        roughness: 0.5,
        color: "#000000",
        clearcoat: 1,
        clearcoatRoughness: 0
      }
    );
  };
  