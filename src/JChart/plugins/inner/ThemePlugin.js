import colorString from 'color-string';
const styles = {
    'theme-chart-color1': 'rgb(103, 170, 245)',
    'theme-chart-rgba-color1': 'rgba(103, 170, 245, 0.1)',
    'theme-chart-sub-color1': 'rgba(103, 170, 245, 0.6)',


    'theme-chart-color2': 'rgb(255, 174, 60)',
    'theme-chart-rgba-color2': 'rgba(255, 174, 60, 0.1)',
    'theme-chart-sub-color2': 'rgba(255, 174, 60, 0.6)',

    'theme-chart-color3': 'rgb(78, 201, 171)',
    'theme-chart-rgba-color3': 'rgba(78, 201, 171, 0.1)',
    'theme-chart-sub-color3': 'rgba(78, 201, 171, 0.6)',

    'theme-chart-color4': 'rgb(245, 131, 122)',
    'theme-chart-rgba-color4': 'rgba(245, 131, 122, 0.1)',
    'theme-chart-sub-color4': 'rgba(245, 131, 122, 0.6)',

    'theme-chart-color5': 'rgb(158, 156, 246)',
    'theme-chart-rgba-color5': 'rgba(158, 156, 246, 0.1)',
    'theme-chart-sub-color5': 'rgba(158, 156, 246, 0.6)',

    'theme-chart-color6': 'rgb(30, 192, 216)',
    'theme-chart-rgba-color6': 'rgba(30, 192, 216, 0.1)',
    'theme-chart-sub-color6': 'rgba(30, 192, 216, 0.6)',

    'theme-chart-color7': 'rgb(138, 205, 78)',
    'theme-chart-rgba-color7': 'rgba(138, 205, 78, 0.1)',
    'theme-chart-sub-color7': 'rgba(138, 205, 78, 0.6)',

    'theme-chart-color8': 'rgb(237, 139, 204)',
    'theme-chart-rgba-color8': 'rgba(237, 139, 204, 0.1)',
    'theme-chart-sub-color8': 'rgba(237, 139, 204, 0.6)',

    'theme-chart-color9': 'rgb(135, 206, 232)',
    'theme-chart-rgba-color9': 'rgba(135, 206, 232, 0.1)',
    'theme-chart-sub-color9': 'rgba(135, 206, 232, 0.6)',

    'theme-chart-color10': 'rgb(97, 218, 198)',
    'theme-chart-rgba-color10': 'rgba(97, 218, 198, 0.1)',
    'theme-chart-sub-color10': 'rgba(97, 218, 198, 0.6)',

    'theme-chart-color11': 'rgb(198, 156, 246)',
    'theme-chart-rgba-color11': 'rgba(198, 156, 246, 0.1)',
    'theme-chart-sub-color11': 'rgba(198, 156, 246, 0.6)',

    'theme-chart-color12': 'rgb(137, 170, 247)',
    'theme-chart-rgba-color12': 'rgba(137, 170, 247, 0.1)',
    'theme-chart-sub-color12': 'rgba(137, 170, 247, 0.6)',

    'theme-chart-color13': 'rgb(251, 155, 108)',
    'theme-chart-rgba-color13': 'rgba(251, 155, 108, 0.1)',
    'theme-chart-sub-color13': 'rgba(251, 155, 108, 0.8)',

    'theme-chart-color14': 'rgb(103, 170, 245)',
    'theme-chart-rgba-color14': 'rgba(103, 170, 245, 0.6)',
    'theme-chart-sub-color14': 'rgba(103, 170, 245, 0.8)',

    'theme-chart-color15': 'rgb(134, 187, 231)',
    'theme-chart-rgba-color15': 'rgba(134, 187, 231, 0.6)',
    'theme-chart-sub-color15': 'rgba(103, 170, 245, 0.8)',

    'theme-chart-color16': 'rgb(245, 196, 80)',
    'theme-chart-rgba-color16': 'rgba(245, 196, 80, 0.6)',
    'theme-chart-sub-color16': 'rgba(103, 170, 245, 0.8)',

    'theme-chart-color17': 'rgb(135, 206, 232)',
    'theme-chart-rgba-color17': 'rgba(135, 206, 232, 0.6)',
    'theme-chart-sub-color17': 'rgba(135, 206, 232, 0.8)',

    'theme-chart-color18': 'rgb(239, 216, 22)',
    'theme-chart-rgba-color18': 'rgba(239, 216, 22, 0.6)',
    'theme-chart-sub-color18': 'rgba(239, 216, 22, 0.8)',

    'theme-chart-color19': 'rgb(92, 208, 133)',
    'theme-chart-rgba-color19': 'rgba(92, 208, 133, 0.6)',
    'theme-chart-sub-color19': 'rgba(92, 208, 133, 0.8)',

    'theme-chart-color20': 'rgb(241, 126, 248)',
    'theme-chart-rgba-color20': 'rgba(241, 126, 248, 0.6)',
    'theme-chart-sub-color20': 'rgba(241, 126, 248, 0.8)',
};


class ThemePlugin {
    constructor(options) {
        this.name = 'ThemePlugin';
        this.options = options;
    }

    apply(globalCtx) {
        globalCtx.hooks.initTheme.tap(this.name, () => {
            globalCtx.theme.series = {
                get(idx) {
                    const i = idx % 20 + 1;
                    return {
                        color: colorString.get.rgb(styles[`theme-chart-color${i}`]),
                        subColor: colorString.get.rgb(styles[`theme-chart-sub-color${i}`]),
                        opacityColor: colorString.get.rgb(styles[`theme-chart-rgba-color${i}`]),
                    };
                },
            };
            // globalCtx.theme.series = new Array(20).fill(1).map((s, idx) => ());
        });
    }
}

export default ThemePlugin;
