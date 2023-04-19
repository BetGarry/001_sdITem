import * as SDV from "@shapediver/viewer";
import { MaterialEngine } from "@shapediver/viewer";
import { container } from "tsyringe";
import {
  gems,
  IGemMaterialProperties,
  IGemMaterialSettings
} from "./definitions";
import {
  createCustomUi,
  createParameterUi,
  IDropdownElement,
  ISliderElement,
  IStringElement,
  updateCustomUi,
  updateParameterUi
} from "./ui";

(<any>window).SDV = SDV;

//const menuLeft = <HTMLDivElement>document.getElementById("menu-left");
const menuRight = <HTMLDivElement>document.getElementById("menu-right");

let session: SDV.ISessionApi;
let viewport: SDV.IViewportApi;

const materialEngine: MaterialEngine = <MaterialEngine>(
  container.resolve(MaterialEngine)
);

export const updateGemMaterial = async (properties: IGemMaterialProperties) => {
  const gemMaterialProperties: SDV.IMaterialGemDataProperties = {};
  for (let p in properties) {
    if (p === "impurityMap" && properties.impurityMap) {
      gemMaterialProperties.impurityMap =
        (await materialEngine.loadMap(<string>properties.impurityMap)) ||
        undefined;
    } else {
      (<any>(
        gemMaterialProperties[<keyof SDV.IMaterialGemDataProperties>p]
      )) = properties[<keyof IGemMaterialProperties>p];
    }
  }

  const outputNames = [
    "SmallSideDiamonds",
    "BigSideDiamonds",
    "BigDiamond",
    "Gem"
  ];
  for (let j = 0; j < outputNames.length; j++) {
    const output = session
      .getOutputByName("gemsAll")
      .find((o) => !o.format.includes("material"));
    if (!output) continue;
    output.node!.traverse((n) => {
      console.log(output);
      for (let i = 0; i < n.data.length; i++) {
        if (n.data[i] instanceof SDV.GeometryData) {
          (<SDV.GeometryData>(
            n.data[i]
          )).primitive.material = new SDV.MaterialGemData(
            gemMaterialProperties
          );
        }
      }
    });
    output.node?.updateVersion();
  }
  viewport.update();
};

const update = (settings: IGemMaterialSettings) => {
  //updateCustomUi(settings.properties, menuLeft);
  updateParameterUi(settings.parameters, menuRight);
};

const createInitialUi = () => {
 
  createCustomUi(
    [
      // <ISliderElement>{
      //   name: "Auto Rotation Speed",
      //   type: "slider",
      //   min: -10,
      //   max: 10,
      //   step: 0.1,
      //   value: (<SDV.IPerspectiveCameraApi>viewport.camera).autoRotationSpeed,
      //   callback: (value: string) => {
      //     (<SDV.IPerspectiveCameraApi>(
      //       viewport.camera
      //     )).autoRotationSpeed = +value;
      //   }
      // },
      <IDropdownElement>{
        name: "Presets",
        type: "dropdown",
        callback: (value: string) => {
          update(Object.values(gems)[+value]);
        },
        choices: Object.keys(gems),
        value: "Diamond"
      }
    ],
    menuRight
  );

  createParameterUi(session, menuRight);
  update(gems["Diamond"]);
};

(async () => {
  viewport = await SDV.createViewport({
    id: "myViewport",
    canvas: <HTMLCanvasElement>document.getElementById("canvas"),
    branding: {
      backgroundColor: "#374151"
    }
  });
  session = await SDV.createSession({
    id: "mySession",
    ticket:
      "568f7584578af4744b00abc005c2d6728438881265fc1a9f3cbe61ba50ed51cb88ecc44743819d73796b296cf8656210c87f471147f541216c82f000c6213167e63053b8bf2389e3874c04cace37d879413625c06940ec56c921cd065afd2fb308e9ef0b7f3b843c367a804006bd0fe38e7db3d43a260c43-3036412085067810f1c9d853198afea5",
    modelViewUrl: "https://sdeuc1.eu-central-1.shapediver.com"
  });

  viewport.clearColor = "#374151";

  createInitialUi();
  viewport.camera!.zoomTo();
})();
