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

const menuLeft = <HTMLDivElement>document.getElementById("menu-left");
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
  updateCustomUi(settings.properties, menuLeft);
  updateParameterUi(settings.parameters, menuRight);
};

const createInitialUi = () => {
  createCustomUi(
    [
      <ISliderElement>{
        tooltip:
          "The refraction index (or refractive index) provides information about the bending of light within the medium.",
        key: "refractionIndex",
        name: "Refraction Index",
        type: "slider",
        min: 1,
        max: 4,
        step: 0.01
      },
      <IStringElement>{
        tooltip:
          "The impurity map is used to simulate small imperfections. See the emerald example to see this property in use.",
        key: "impurityMap",
        name: "Impurity Map",
        type: "string"
      },
      <ISliderElement>{
        tooltip:
          "The impurity scale is a range that is used to control the effect of the impurity map.",
        key: "impurityScale",
        name: "Impurity Scale",
        type: "slider",
        min: 0,
        max: 1,
        step: 0.01
      },
      <IStringElement>{
        tooltip:
          "To simulate the color depth of gemstones, we use to color values that are interpolated depending on the depth of the tracing.",
        key: "colorTransferBegin",
        name: "Color Transfer Begin",
        type: "string"
      },
      <IStringElement>{
        tooltip:
          "To simulate the color depth of gemstones, we use to color values that are interpolated depending on the depth of the tracing.",
        key: "colorTransferEnd",
        name: "Color Transfer End",
        type: "string"
      },
      <ISliderElement>{
        tooltip: "Adjusts the gamma value of the gem rendering.",
        key: "gamma",
        name: "Gamma",
        type: "slider",
        min: 0,
        max: 2,
        step: 0.01
      },
      <ISliderElement>{
        tooltip: "Adjusts the contrast value of the gem rendering.",
        key: "contrast",
        name: "Contrast",
        type: "slider",
        min: 0,
        max: 5,
        step: 0.01
      },
      <ISliderElement>{
        tooltip: "Adjusts the brightness value of the gem rendering.",
        key: "brightness",
        name: "Brightness",
        type: "slider",
        min: -1,
        max: 1,
        step: 0.01
      },
      <ISliderElement>{
        tooltip:
          "Dispersion is a phenomenon that splits light rays into their separate color components. To simulate this, we have an approximation of dispersion. This value can be used to adjust the impact of the dispersion effect.",
        key: "dispersion",
        name: "Dispersion",
        type: "slider",
        min: 0,
        max: 1,
        step: 0.01
      },
      <ISliderElement>{
        tooltip:
          "In the real world, the light bounces through gem stones an infinite amount of times and splits into infinete separate rays. As this is not possible for us we have a fixed tracing depth that can be adjusted.",
        key: "tracingDepth",
        name: "Tracing Depth",
        type: "slider",
        min: 1,
        max: 10,
        step: 1
      },
      <ISliderElement>{
        tooltip:
          "To adjust the opacity of the stone, this value can be used. The overall opacity is still affected by the probability of the incident refraction, but this value can be used to have influence on it.",
        key: "tracingOpacity",
        name: "Tracing Opacity",
        type: "slider",
        min: 0,
        max: 1,
        step: 0.01
      }
    ],
    menuLeft
    );
    console.log ("i`m here?");

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
      "6d0a5b5f2a81780fbd95e76b59d22ef4b8b970f4580b2a285e1ed4477103a2bf8b50245bcda263c8cb2a32745c12d90a4e0176457c06771dc57e2aeee826903827e7a1ffffdf2bfca6bfa792a0b6882644e5764dc19a3cfc43bcd4811522b487e08fd1b052c684-97a8af03a79e04416cd30af1663e3e89",
    modelViewUrl: "https://sdeuc1.eu-central-1.shapediver.com"
  });

  viewport.clearColor = "#374151";

  createInitialUi();
  viewport.camera!.zoomTo();
})();
