<template>
    <div>
        <pre id="display" style="height: 400px;overflow: scroll;"></pre>
    </div>
</template>

<script>
import * as Diff from 'diff';
export default {
    name: 'u-yaml-diff',
    props: {
        original: String,
        target: String,
    },
    data() {
        return {

        };
    },
    watch: {
        target(newVal) {
            this.getDiff();
        },
    },
    methods: {
        getDiff() {
            if (this.original || this.target) {
                let color = '';
                let node = null;
                const diff = Diff.diffJson(this.original, this.target);
                const display = document.getElementById('display');
                const fragment = document.createDocumentFragment();

                diff.forEach((part) => {
                    if (part.removed) {
                        part.value = '-' + part.value;
                        node = document.createElement('del');
                        node.appendChild(document.createTextNode(part.value));
                    } else if (part.added) {
                        part.value = '+' + part.value;
                        node = document.createElement('ins');
                        node.appendChild(document.createTextNode(part.value));
                    } else {
                        color = 'grey';
                        node = document.createTextNode(part.value);
                    }
                    fragment.appendChild(node);
                });
                if (display) {
                    display.textContent = '';
                    display.appendChild(fragment);
                }
            }
        },
    },
};
</script>

<style module>
del{
	color: #b30000;
	background: #fadad7;
    text-decoration: none;
}
ins{
	background: #eaf2c2;
	color: #406619;
	text-decoration: none;
}
</style>
