const initialTitle = document.title;
export default {
    created() {
        const title = ((this.$route || {}).meta || {}).docTitle || this.$options.docTitle;
        if (title)
            document.title = title + ' - ' + initialTitle;
        else
            document.title = initialTitle;
    },
};
