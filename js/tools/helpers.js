export function onWindowOnload(newFunction)
{
    let oldFunction = window.onload;
    window.onload = function(ev) {
        if (oldFunction) 
            oldFunction.apply(window,ev);
        newFunction();
    };
}

export function createSlider(name, min, max, step, value) {
    let slider = document.createElement("input");
    slider.setAttribute("type", "range");
    slider.setAttribute("min", min);
    slider.setAttribute("max", max);
    slider.setAttribute("step", step);
    slider.setAttribute("value", value);
    slider.id = name + "-slider";

    let label = document.createElement("span");
    label.id = name + "-label";
    label.innerHTML = name + ": " + value;

    document.getElementById('inputs').appendChild(label);
    document.getElementById('inputs').appendChild(slider);
    return [slider, label];
}