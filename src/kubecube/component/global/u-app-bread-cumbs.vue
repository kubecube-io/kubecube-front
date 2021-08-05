<template>
  <u-crumb>
    <u-crumb-item
      v-if="prefix"
      :to="prefix.to"
    >
      {{ prefix.text }}
    </u-crumb-item>
    <u-crumb-item
      v-for="c in crumbs"
      :key="c.to.path"
      :to="c.to"
      :disabled="c.disabled"
    >
      {{ c.text }}
    </u-crumb-item>
  </u-crumb>
</template>

<script>
import { isFunction } from 'lodash';
export default {
    props: {
        relative: {
            type: String,
            default: '',
        },
        prefix: {
            type: Object,
            default: null,
        },
    },
    computed: {
        crumbs() {
            const pathArray = this.$route.path.split('/');
            pathArray.shift();

            const relativeTo = pathArray.findIndex(p => p === this.relative) + 1;

            const relative = pathArray.slice(relativeTo);
            const remainPath = pathArray.slice(0, relativeTo).join('/');
            const relativeMatched = this.$route.matched.slice(relativeTo + 1);
            console.log(relativeTo, relative, relativeMatched, remainPath);
            const breadcrumbs = [];
            for (let idx = 0; idx < relative.length; idx++) {
                const p = relative[idx];
                const c = relativeMatched[idx];
                console.log(remainPath);
                const last = breadcrumbs[idx - 1] || { to: { path: `/${remainPath}` } };
                if (!c) break;
                if (c.meta.subroot) break;
                if (c.meta.skip) continue;
                const ctext = isFunction(c.meta.breadCrumb) ? c.meta.breadCrumb(p, relative) : c.meta.breadCrumb;
                const breadDisabled = c.meta.breadDisabled;
                console.log(last.to.path);
                const crumb = {
                    to: {
                        path: `${last.to.path}/${p}`,
                    },
                    disabled: breadDisabled,
                    text: ctext,
                };

                breadcrumbs.push(crumb);

            }
            return breadcrumbs;
        },
    },
};
</script>

<style>

</style>
