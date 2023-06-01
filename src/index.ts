import "reflect-metadata";
import * as SDV from "@shapediver/viewer";
import { MaterialEngine } from "@shapediver/viewer";
import { container } from "tsyringe";
import { gems, viewSetups, IGemMaterialProperties, IGemMaterialSettings, IRenderProperties, IRenderSettings  } from "./definitions";
import { createCustomUi, createParameterUi, createCustomUi2, IDropdownElement, ISliderElement, IStringElement, IDropdownElement2, ISliderElement2, IStringElement2, updateCustomUi, updateCustomUi2, updateParameterUi, ICheckboxElement } from "./ui";
import axios from 'axios';

(<any>window).SDV = SDV;

const menuLeft = <HTMLDivElement>document.getElementById("menu-left");
const menuRight = <HTMLDivElement>document.getElementById("menu-right");

let session: SDV.ISessionApi;
let viewport: SDV.IViewportApi;

// Add a new array for storing model configurations and a variable for the current model index
let tickets = [];
let currentIndex = 0;


const materialEngine: MaterialEngine = <MaterialEngine>(container.resolve(MaterialEngine));

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
  }; 

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
          )).material = new SDV.MaterialGemData(
            gemMaterialProperties
          );
        }
      }
    });
    output.node?.updateVersion();
  }
  viewport.update();
};


export const updateRenderSettings = (
  settings: IRenderProperties
) => {
  for (let p in settings) {
    viewport = settings[p];
  }
  viewport.update();
};

const resetUI = () => {

  // Check if there are any child elements in the menus
  if (menuLeft.hasChildNodes() || menuRight.hasChildNodes()) {
    // Reset the UI for the menus
    menuLeft.innerHTML = "";
    menuRight.innerHTML = "";
  }
};

const createSubMenu = (
  title: string,
  elements: Array<IDropdownElement | ISliderElement | IStringElement >,
  parentMenu: HTMLDivElement
) => {
  const subMenu = document.createElement('div');
  subMenu.classList.add('sub-menu');

  const subMenuTitle = document.createElement('h2');
  subMenuTitle.textContent = title;

  subMenu.appendChild(subMenuTitle);

  createCustomUi(elements, subMenu);
  parentMenu.appendChild(subMenu);
};
const createSubMenu2 = (
  title: string,
  elements: Array<ICheckboxElement | ISliderElement2 | IStringElement2 | IDropdownElement2>,
  parentMenu: HTMLDivElement
) => {
  const subMenu = document.createElement('div');
  subMenu.classList.add('sub-menu');

  const subMenuTitle = document.createElement('h2');
  subMenuTitle.textContent = title;

  subMenu.appendChild(subMenuTitle);

  elements.forEach(element => createCustomUi2(element, subMenu));

  parentMenu.appendChild(subMenu);
};


const update = (settings: IGemMaterialSettings) => {
  console.log('hi');
  updateCustomUi(settings.properties, menuLeft);
  console.log('hi0');
  updateParameterUi(settings.parameters, menuRight);

};
const update2 = (settings: IRenderSettings) => {
  updateCustomUi2(settings.properties, menuLeft);
  console.log('hi2');
};


const createInitialUi = () => {
  // Clear existing menus

  // Gem material properties
  createSubMenu(
    'Gem Material',
    [
      <IDropdownElement>{
        tooltip:
          'The environment map plays a huge role in the rendering of the gemstones. Not only does it provide additional color input, it also adds illumination. This illumination can vary depending on the map that is chosen. Therefore, it might be necessary to adapt other properties when changing the environment map (like gamma, contrast or brightness). The presets are adjusted to the "photo_studio_broadway_hall" map.',
        key: "environmentMap",
        name: "Environment Map",
        type: "dropdown",
        callback: (value: string) => {
          let tokenStart: string,
            tokenEnd: string,
            tokenCancel: string,
            taskID: string,
            busyFlag: string;
          tokenStart = SDV.addListener(SDV.EVENTTYPE.TASK.TASK_START, (e) => {
            const taskEvent = <SDV.ITaskEvent>e;
            if (taskEvent.type === SDV.TASK_TYPE.ENVIRONMENT_MAP_LOADING) {
              taskID = taskEvent.id;
              //busyFlag = viewport.addFlag(SDV.FLAG_TYPE.BUSY_MODE);
              SDV.removeListener(tokenStart);
            }
          });

          const endCB = (e: SDV.IEvent) => {
            const taskEvent = <SDV.ITaskEvent>e;
            if (
              taskEvent.type === SDV.TASK_TYPE.ENVIRONMENT_MAP_LOADING &&
              taskID === taskEvent.id
            ) {
              viewport.update();
              //viewport.removeFlag(busyFlag);
              SDV.removeListener(tokenEnd);
              SDV.removeListener(tokenCancel);
            }
          };

          tokenEnd = SDV.addListener(SDV.EVENTTYPE.TASK.TASK_END, endCB);
          tokenCancel = SDV.addListener(SDV.EVENTTYPE.TASK.TASK_CANCEL, endCB);

          viewport.environmentMap = Object.values(SDV.ENVIRONMENT_MAP)[+value];
        },
        choices: Object.values(SDV.ENVIRONMENT_MAP),
        value: viewport.environmentMap
      },
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
    // Render properties
  createSubMenu2( 
    'Render Properties',
  [
        <ICheckboxElement>{
        name: "Ambient Occlusion",
        tooltip: 'Ambient occlusion.',
        key: "ambientOcclusion",
        type:"checkbox",
        callback: (value: boolean) => {
          viewport.ambientOcclusion = value;
        },
        value: viewport.ambientOcclusion,

      },
        <ISliderElement2>{
        tooltip: 'Ambient occlusion intensity.',
        key: "ambientOcclusionIntensity",
        name: "Ambient Occlusion Intensity",
        type: "slider",
        min: 0,
        max: 1,
        step: 0.01,
        callback: (value: number) => {
          viewport.ambientOcclusionIntensity = value;
        },
        value: viewport.ambientOcclusionIntensity,

      },
        <ISliderElement2>{
          tooltip: "Adjust the clear alpha value.",
          key: "clearAlpha",
          name: "Clear Alpha",
          type: "slider",
          min: 0,
          max: 1,
          step: 0.01,
          callback: (value: number) => {
            viewport.clearAlpha = value;
          },
          value: viewport.clearAlpha

        },
        <IStringElement2>{
          tooltip: "Specify the environment map.",
          key: "environmentMap",
          name: "Environment Map",
          type: "string", 
          callback: (value: string) => {
            viewport.environmentMap = viewport.environmentMap[value];
          },
          value: viewport.environmentMap
        },

        <IDropdownElement2>{
          tooltip: 'Select the tone mapping method.',
          key: "toneMapping",
          name: "Tone Mapping",
          type: "dropdown",
          choices: ["aces_filmis", "cineon", "linear", "none", "reinhard"],
          callback: (value: string) => {
            viewport.toneMapping = viewport.toneMapping[value];
          },
        },
        <ISliderElement2>{
          tooltip: 'Select the tone mapping exposure level.',
          key: "toneMappingExposure",
          name: "Tone Mapping Exposure",
          type: "slider",
          min: 0,
          max: 1,
          step: 0.01,
          value:viewport.toneMappingExposure,
          callback: (value: number) => {
            viewport.toneMappingExposure = viewport.toneMappingExposure[value];
          }
          },
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
  console.log('hi');
  update2(viewSetups["default"])
};

const STRAPI_TICKET_URL = "http://localhost:1337/api/shape-diver-configs";

// Modify your asynchronous function to call startSession instead of directly creating the session
(async () => {
  const response = await axios.get(STRAPI_TICKET_URL);

  viewport = await SDV.createViewport({
    id: "myViewport",
    canvas: <HTMLCanvasElement>document.getElementById("canvas"),
    branding: {
      backgroundColor: "#374151"
    }

  });

  // Fetch and start the first session
  fetchConfigs();
})();

// New function for fetching the configurations
const fetchConfigs = async () => {
  try {

    const response = await axios.get(STRAPI_TICKET_URL);
    if (response.status === 200) {
      tickets = response.data.data;
      console.log(tickets[currentIndex].attributes.ticket);
      startSession({
        containerId:"canvas",
        modelViewUrl: "https://sdeuc1.eu-central-1.shapediver.com",
        ticket: tickets[currentIndex].attributes.ticket,
        waitForOutputs: true
      }); // start session with first configuration
    }
  } catch (error) {
    console.error('Failed to fetch models', error);
  }
}

// New function for starting a new session
const startSession = async (config) => {
  // close the previous session if exists
  if (session) {
    session.close();
  }

  session = await SDV.createSession(config);
  resetUI();
  createInitialUi();
  viewport.update();
}

// New event listeners for the model-switching buttons
document.getElementById("prevButton").addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + tickets.length) % tickets.length;
  startSession({
    containerId:"canvas",
    modelViewUrl: "https://sdeuc1.eu-central-1.shapediver.com",
    ticket: tickets[currentIndex].attributes.ticket,
    waitForOutputs: true
  });
});

document.getElementById("nextButton").addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % tickets.length;
  startSession({
    containerId:"canvas",
    modelViewUrl: "https://sdeuc1.eu-central-1.shapediver.com",
    ticket: tickets[currentIndex].attributes.ticket,
    waitForOutputs: true
  });
});
