var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as SDV from "@shapediver/viewer";
import { MaterialEngine } from "@shapediver/viewer";
import { container } from "tsyringe";
import { gems } from "./definitions";
import { createCustomUi, createParameterUi, updateCustomUi, updateParameterUi } from "./ui";
window.SDV = SDV;
const menuLeft = document.getElementById("menu-left");
const menuRight = document.getElementById("menu-right");
let session;
let viewport;
const materialEngine = (container.resolve(MaterialEngine));
export const updateGemMaterial = (properties) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const gemMaterialProperties = {};
    for (let p in properties) {
        if (p === "impurityMap" && properties.impurityMap) {
            gemMaterialProperties.impurityMap =
                (yield materialEngine.loadMap(properties.impurityMap)) ||
                    undefined;
        }
        else {
            (gemMaterialProperties[p]) = properties[p];
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
        if (!output)
            continue;
        output.node.traverse((n) => {
            console.log(output);
            for (let i = 0; i < n.data.length; i++) {
                if (n.data[i] instanceof SDV.GeometryData) {
                    (n.data[i]).primitive.material = new SDV.MaterialGemData(gemMaterialProperties);
                }
            }
        });
        (_a = output.node) === null || _a === void 0 ? void 0 : _a.updateVersion();
    }
    viewport.update();
});
const update = (settings) => {
    updateCustomUi(settings.properties, menuLeft);
    updateParameterUi(settings.parameters, menuRight);
};
const createInitialUi = () => {
    createCustomUi([
        {
            tooltip: 'The environment map plays a huge role in the rendering of the gemstones. Not only does it provide additional color input, it also adds illumination. This illumination can vary depending on the map that is chosen. Therefore, it might be necessary to adapt other properties when changing the environment map (like gamma, contrast or brightness). The presets are adjusted to the "photo_studio_broadway_hall" map.',
            key: "environmentMap",
            name: "Environment Map",
            type: "dropdown",
            callback: (value) => {
                let tokenStart, tokenEnd, tokenCancel, taskID, busyFlag;
                tokenStart = SDV.addListener(SDV.EVENTTYPE.TASK.TASK_START, (e) => {
                    const taskEvent = e;
                    if (taskEvent.type === SDV.TASK_TYPE.ENVIRONMENT_MAP_LOADING) {
                        taskID = taskEvent.id;
                        //busyFlag = viewport.addFlag(SDV.FLAG_TYPE.BUSY_MODE);
                        SDV.removeListener(tokenStart);
                    }
                });
                const endCB = (e) => {
                    const taskEvent = e;
                    if (taskEvent.type === SDV.TASK_TYPE.ENVIRONMENT_MAP_LOADING &&
                        taskID === taskEvent.id) {
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
        {
            tooltip: "The refraction index (or refractive index) provides information about the bending of light within the medium.",
            key: "refractionIndex",
            name: "Refraction Index",
            type: "slider",
            min: 1,
            max: 4,
            step: 0.01
        },
        {
            tooltip: "The impurity map is used to simulate small imperfections. See the emerald example to see this property in use.",
            key: "impurityMap",
            name: "Impurity Map",
            type: "string"
        },
        {
            tooltip: "The impurity scale is a range that is used to control the effect of the impurity map.",
            key: "impurityScale",
            name: "Impurity Scale",
            type: "slider",
            min: 0,
            max: 1,
            step: 0.01
        },
        {
            tooltip: "To simulate the color depth of gemstones, we use to color values that are interpolated depending on the depth of the tracing.",
            key: "colorTransferBegin",
            name: "Color Transfer Begin",
            type: "string"
        },
        {
            tooltip: "To simulate the color depth of gemstones, we use to color values that are interpolated depending on the depth of the tracing.",
            key: "colorTransferEnd",
            name: "Color Transfer End",
            type: "string"
        },
        {
            tooltip: "Adjusts the gamma value of the gem rendering.",
            key: "gamma",
            name: "Gamma",
            type: "slider",
            min: 0,
            max: 2,
            step: 0.01
        },
        {
            tooltip: "Adjusts the contrast value of the gem rendering.",
            key: "contrast",
            name: "Contrast",
            type: "slider",
            min: 0,
            max: 5,
            step: 0.01
        },
        {
            tooltip: "Adjusts the brightness value of the gem rendering.",
            key: "brightness",
            name: "Brightness",
            type: "slider",
            min: -1,
            max: 1,
            step: 0.01
        },
        {
            tooltip: "Dispersion is a phenomenon that splits light rays into their separate color components. To simulate this, we have an approximation of dispersion. This value can be used to adjust the impact of the dispersion effect.",
            key: "dispersion",
            name: "Dispersion",
            type: "slider",
            min: 0,
            max: 1,
            step: 0.01
        },
        {
            tooltip: "In the real world, the light bounces through gem stones an infinite amount of times and splits into infinete separate rays. As this is not possible for us we have a fixed tracing depth that can be adjusted.",
            key: "tracingDepth",
            name: "Tracing Depth",
            type: "slider",
            min: 1,
            max: 10,
            step: 1
        },
        {
            tooltip: "To adjust the opacity of the stone, this value can be used. The overall opacity is still affected by the probability of the incident refraction, but this value can be used to have influence on it.",
            key: "tracingOpacity",
            name: "Tracing Opacity",
            type: "slider",
            min: 0,
            max: 1,
            step: 0.01
        }
    ], menuLeft);
    createCustomUi([
        {
            name: "Auto Rotation Speed",
            type: "slider",
            min: -10,
            max: 10,
            step: 0.1,
            value: viewport.camera.autoRotationSpeed,
            callback: (value) => {
                (viewport.camera).autoRotationSpeed = +value;
            }
        },
        {
            name: "Presets",
            type: "dropdown",
            callback: (value) => {
                update(Object.values(gems)[+value]);
            },
            choices: Object.keys(gems),
            value: "Diamond"
        }
    ], menuRight);
    createParameterUi(session, menuRight);
    update(gems["Diamond"]);
};
(() => __awaiter(void 0, void 0, void 0, function* () {
    viewport = yield SDV.createViewport({
        id: "myViewport",
        canvas: document.getElementById("canvas"),
        branding: {
            backgroundColor: "#374151"
        }
    });
    session = yield SDV.createSession({
        id: "mySession",
        ticket: "568f7584578af4744b00abc005c2d6728438881265fc1a9f3cbe61ba50ed51cb88ecc44743819d73796b296cf8656210c87f471147f541216c82f000c6213167e63053b8bf2389e3874c04cace37d879413625c06940ec56c921cd065afd2fb308e9ef0b7f3b843c367a804006bd0fe38e7db3d43a260c43-3036412085067810f1c9d853198afea5",
        modelViewUrl: "https://sdeuc1.eu-central-1.shapediver.com"
    });
    viewport.clearColor = "#374151";
    createInitialUi();
    viewport.camera.zoomTo();
}))();
