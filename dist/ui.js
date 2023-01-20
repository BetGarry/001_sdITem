var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ENVIRONMENT_MAP, PARAMETER_TYPE, viewports } from "@shapediver/viewer";
import { updateGemMaterial } from "./index";
let gemDefinition = {
    environmentMap: ENVIRONMENT_MAP.PHOTO_STUDIO,
    refractionIndex: 2.4,
    impurityMap: undefined,
    impurityScale: 1,
    colorTransferBegin: "#ffffff",
    colorTransferEnd: "#ffffff",
    gamma: 1,
    contrast: 1,
    brightness: 0,
    dispersion: 0.15,
    tracingDepth: 8,
    tracingOpacity: 0.25
};
export const updateCustomUi = (dev, parent) => {
    for (let p in dev) {
        gemDefinition[p] = dev[p];
        const paramDiv = parent.querySelector("[name=" + p + "]");
        const paramType = paramDiv.getAttribute("type");
        if (paramType === "slider") {
            const inputElement = (paramDiv.querySelector('[name="inputElement"]'));
            const valueLabel = (paramDiv.querySelector('[name="valueLabel"]'));
            inputElement.value = dev[p] + "";
            valueLabel.innerHTML = dev[p] + "";
        }
        else if (paramType === "dropdown") {
            const inputElement = (paramDiv.querySelector('[name="inputElement"]'));
            const valueIndex = Object.values(ENVIRONMENT_MAP).indexOf(gemDefinition[p]);
            inputElement.childNodes[valueIndex].setAttribute("selected", "");
            inputElement.onchange(new Event("custom"));
        }
        else if (paramType === "string") {
            const inputElement = (paramDiv.querySelector('[name="inputElement"]'));
            inputElement.value =
                dev[p] === undefined
                    ? ""
                    : dev[p] + "";
        }
    }
    updateGemMaterial(dev);
};
export const createCustomUi = (elements, parent) => {
    for (let i = 0; i < elements.length; i++) {
        const menuElement = elements[i];
        const paramDiv = document.createElement("div");
        if (menuElement.tooltip)
            paramDiv.setAttribute("title", menuElement.tooltip);
        if (menuElement.key)
            paramDiv.setAttribute("name", menuElement.key);
        paramDiv.setAttribute("type", menuElement.type);
        const label = document.createElement("label");
        const valueLabel = document.createElement("label");
        valueLabel.setAttribute("name", "valueLabel");
        label.innerHTML = menuElement.name;
        let inputElement = null;
        if (menuElement.type === "slider") {
            const div = document.createElement("div");
            div.style.justifyContent = "space-between";
            div.style.display = "flex";
            const sliderElement = menuElement;
            inputElement = document.createElement("input");
            inputElement.setAttribute("name", "inputElement");
            inputElement.setAttribute("type", "range");
            inputElement.setAttribute("min", sliderElement.min + "");
            inputElement.setAttribute("max", sliderElement.max + "");
            inputElement.setAttribute("step", sliderElement.step + "");
            const value = menuElement.key
                ? gemDefinition[menuElement.key]
                : sliderElement.value;
            inputElement.setAttribute("value", value + "");
            valueLabel.innerHTML = value + "";
            inputElement.classList.value =
                "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700";
            label.classList.value =
                "mt-2 text-sm font-medium text-gray-900 dark:text-gray-300";
            valueLabel.classList.value =
                "mt-2 text-sm font-medium text-gray-900 dark:text-gray-300";
            div.appendChild(label);
            div.appendChild(valueLabel);
            paramDiv.appendChild(div);
            paramDiv.appendChild(inputElement);
            inputElement.onchange = () => {
                valueLabel.innerHTML = inputElement.value + "";
                if (menuElement.key)
                    gemDefinition[menuElement.key] = +inputElement.value;
                updateGemMaterial(gemDefinition);
                if (menuElement.callback)
                    menuElement.callback(inputElement.value);
            };
            inputElement.oninput = () => {
                valueLabel.innerHTML = inputElement.value + "";
            };
        }
        else if (menuElement.type === "dropdown") {
            const dropdownElement = menuElement;
            inputElement = document.createElement("select");
            inputElement.setAttribute("name", "inputElement");
            const valueIndex = Object.values(ENVIRONMENT_MAP).indexOf(dropdownElement.value);
            for (let j = 0; j < dropdownElement.choices.length; j++) {
                let option = document.createElement("option");
                option.setAttribute("value", j + "");
                option.setAttribute("name", dropdownElement.choices[j]);
                option.innerHTML = dropdownElement.choices[j];
                option.classList.value =
                    "block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-gray-300";
                if (valueIndex == j)
                    option.setAttribute("selected", "");
                inputElement.appendChild(option);
            }
            inputElement.classList.value =
                "w-full mb-2 mt-2 right-5 text-gray-300 bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-1 py-0.5 text-center inline-flex items-center dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800";
            label.classList.value =
                "block mt-2 text-sm font-medium text-gray-900 dark:text-gray-300";
            paramDiv.appendChild(label);
            paramDiv.appendChild(inputElement);
            inputElement.onchange = () => {
                if (menuElement.callback)
                    menuElement.callback(inputElement.value);
            };
        }
        else if (menuElement.type === "string") {
            inputElement = document.createElement("input");
            inputElement.setAttribute("name", "inputElement");
            inputElement.setAttribute("type", "text");
            const value = menuElement.key
                ? gemDefinition[menuElement.key]
                : menuElement.value;
            inputElement.setAttribute("value", value === undefined ? "" : value);
            inputElement.classList.value =
                "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-300 dark:focus:ring-gray-500 dark:focus:border-gray-500";
            label.classList.value =
                "block mb-2 mt-2 text-sm font-medium text-gray-900 dark:text-gray-300";
            paramDiv.appendChild(label);
            paramDiv.appendChild(inputElement);
            inputElement.onchange = () => {
                if (menuElement.key)
                    gemDefinition[menuElement.key] = inputElement.value;
                updateGemMaterial(gemDefinition);
                if (menuElement.callback)
                    menuElement.callback(inputElement.value);
            };
        }
        if (inputElement) {
            parent.classList.value =
                "code-preview rounded-xl bg-gradient-to-r bg-white border border-gray-900 dark:border-gray-700 p-2 sm:p-6 dark:bg-gray-500";
            parent.appendChild(paramDiv);
        }
    }
    updateGemMaterial(gemDefinition);
};
export const updateParameterUi = (parameters, parent) => {
    for (let p in parameters) {
        const paramDiv = parent.querySelector('[name="' + p + '"]');
        const paramType = paramDiv.getAttribute("type");
        if (paramType === PARAMETER_TYPE.INT ||
            paramType === PARAMETER_TYPE.FLOAT ||
            paramType === PARAMETER_TYPE.EVEN ||
            paramType === PARAMETER_TYPE.ODD) {
            const inputElement = (paramDiv.querySelector('[name="inputElement"]'));
            inputElement.value = parameters[p] + "";
            inputElement.onchange(new Event("custom"));
        }
        else if (paramType === PARAMETER_TYPE.BOOL) {
            const inputElement = (paramDiv.querySelector('[name="inputElement"]'));
            if (parameters[p] === "true")
                inputElement.setAttribute("checked", "");
            inputElement.onchange(new Event("custom"));
        }
        else if (paramType === PARAMETER_TYPE.STRING ||
            paramType === PARAMETER_TYPE.COLOR) {
            const inputElement = (paramDiv.querySelector('[name="inputElement"]'));
            inputElement.value = parameters[p] + "";
            inputElement.onchange(new Event("custom"));
        }
        else if (paramType === PARAMETER_TYPE.STRINGLIST) {
            const inputElement = (paramDiv.querySelector('[name="inputElement"]'));
            inputElement.value = parameters[p];
            inputElement.childNodes[+parameters[p]].setAttribute("selected", "");
            inputElement.onchange(new Event("custom"));
        }
    }
};
export const createParameterUi = (session, parent) => {
    for (let p in session.parameters) {
        if (session.parameters[p].hidden)
            continue;
        const parameterObject = session.parameters[p];
        const paramDiv = document.createElement("div");
        paramDiv.setAttribute("name", p);
        paramDiv.setAttribute("type", parameterObject.type);
        const label = document.createElement("label");
        label.innerHTML = parameterObject.name;
        const valueLabel = document.createElement("label");
        valueLabel.setAttribute("name", "valueLabel");
        let parameterInputElement = null;
        if (parameterObject.type === PARAMETER_TYPE.INT ||
            parameterObject.type === PARAMETER_TYPE.FLOAT ||
            parameterObject.type === PARAMETER_TYPE.EVEN ||
            parameterObject.type === PARAMETER_TYPE.ODD) {
            const div = document.createElement("div");
            div.style.justifyContent = "space-between";
            div.style.display = "flex";
            parameterInputElement = document.createElement("input");
            parameterInputElement.setAttribute("name", "inputElement");
            parameterInputElement.setAttribute("id", parameterObject.id);
            parameterInputElement.setAttribute("type", "range");
            parameterInputElement.setAttribute("min", parameterObject.min !== undefined
                ? parameterObject.min + ""
                : parameterObject.min + "");
            parameterInputElement.setAttribute("max", parameterObject.max !== undefined
                ? parameterObject.max + ""
                : parameterObject.max + "");
            valueLabel.innerHTML = parameterObject.value;
            parameterInputElement.setAttribute("value", parameterObject.value);
            parameterInputElement.classList.value =
                "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700";
            label.classList.value =
                "mt-2 text-sm font-medium text-gray-900 dark:text-gray-300";
            valueLabel.classList.value =
                "mt-2 text-sm font-medium text-gray-900 dark:text-gray-300";
            div.appendChild(label);
            div.appendChild(valueLabel);
            paramDiv.appendChild(div);
            if (parameterObject.type === PARAMETER_TYPE.INT)
                parameterInputElement.setAttribute("step", "1");
            else if (parameterObject.type === PARAMETER_TYPE.EVEN ||
                parameterObject.type === PARAMETER_TYPE.ODD)
                parameterInputElement.setAttribute("step", "2");
            else
                parameterInputElement.setAttribute("step", 1 / Math.pow(10, parameterObject.decimalplaces) + "");
        }
        else if (parameterObject.type === PARAMETER_TYPE.BOOL) {
            parameterInputElement = document.createElement("input");
            parameterInputElement.setAttribute("name", "inputElement");
            parameterInputElement.setAttribute("id", parameterObject.id);
            parameterInputElement.setAttribute("type", "checkbox");
            if (parameterObject.value)
                parameterInputElement.setAttribute("checked", "");
            paramDiv.classList.value = "flex items-center";
            paramDiv.style.justifyContent = "space-between";
            parameterInputElement.classList.value =
                "ml-2 mb-2 mt-2 w-4 h-4 text-gray-600 bg-gray-100 rounded border-gray-300 focus:ring-gray-500 dark:focus:ring-gray-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600";
            label.classList.value =
                "mb-2 mt-2 text-sm font-medium text-gray-900 dark:text-gray-300";
            paramDiv.appendChild(label);
            paramDiv.appendChild(parameterInputElement);
        }
        else if (parameterObject.type === PARAMETER_TYPE.STRING ||
            parameterObject.type === PARAMETER_TYPE.COLOR) {
            parameterInputElement = document.createElement("input");
            parameterInputElement.setAttribute("name", "inputElement");
            parameterInputElement.setAttribute("id", parameterObject.id);
            parameterInputElement.setAttribute("type", "text");
            parameterInputElement.setAttribute("value", parameterObject.value);
            parameterInputElement.classList.value =
                "bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-gray-500 focus:border-gray-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-300 dark:focus:ring-gray-500 dark:focus:border-gray-500";
            label.classList.value =
                "block mb-2 mt-2 text-sm font-medium text-gray-900 dark:text-gray-300";
            paramDiv.appendChild(label);
            paramDiv.appendChild(parameterInputElement);
        }
        else if (parameterObject.type === PARAMETER_TYPE.STRINGLIST) {
            parameterInputElement = document.createElement("select");
            parameterInputElement.setAttribute("name", "inputElement");
            parameterInputElement.setAttribute("id", parameterObject.id);
            for (let j = 0; j < parameterObject.choices.length; j++) {
                let option = document.createElement("option");
                option.setAttribute("value", j + "");
                option.setAttribute("name", parameterObject.choices[j]);
                option.innerHTML = parameterObject.choices[j];
                option.classList.value =
                    "block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-gray-300";
                if (+parameterObject.value == j)
                    option.setAttribute("selected", "");
                parameterInputElement.appendChild(option);
            }
            parameterInputElement.classList.value =
                "w-full mb-2 mt-2 right-5 text-gray-300 bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-1 py-0.5 text-center inline-flex items-center dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800";
            label.classList.value =
                "block mt-2 text-sm font-medium text-gray-900 dark:text-gray-300";
            paramDiv.appendChild(label);
            paramDiv.appendChild(parameterInputElement);
        }
        if (parameterInputElement) {
            parameterInputElement.onchange = () => __awaiter(void 0, void 0, void 0, function* () {
                parameterObject.value =
                    parameterObject.type === PARAMETER_TYPE.BOOL
                        ? parameterInputElement.checked
                        : parameterInputElement.value;
                yield session.customize();
                viewports["myViewport"].update();
                updateGemMaterial(gemDefinition);
            });
            if (parameterObject.hidden)
                paramDiv.setAttribute("hidden", "");
            parent.classList.value =
                "code-preview rounded-xl bg-gradient-to-r bg-white border border-gray-900 dark:border-gray-700 p-2 sm:p-6 dark:bg-gray-500";
            parent.appendChild(paramDiv);
        }
    }
};
