export const mapComponents = (components) => {
    const result = {};
    components.forEach((component) => result[component.options ? component.options.name : component.name] = component);
    return result;
};
