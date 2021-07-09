export default {
    imageLogo(image) {
        if (!image)
            return;

        const distribution2 = image.properties ? image.properties.distribution : '';
        const distribution = image.distribution ? image.distribution : distribution2;
        if (/ubuntu/i.test(distribution))
            return 'ubuntu';

        if (/centos/i.test(distribution))
            return 'centos';

        if (/debian/i.test(distribution))
            return 'debian';

        if (/rhel/i.test(distribution))
            return 'rhel';

        if (!image.OSType)
            return '';

        if (image.OSType === 'linux')
            return 'linux';

        return 'windows';
    },
};
