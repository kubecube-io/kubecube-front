import serService from './service';
import namespaceService from './namespace';
import deploymentService from './deployment';
import podService from './pod';
import eventService from './event';
import ingressService from './ingress';
import secretService from './secret';
import monitorService from './monitor';
import cephService from './ceph';
import volumeService from './volume';
import nodeService from './node';
import configmapService from './configmap';
import statefulsetService from './statefulset';
import ingConService from './ingressController';
import PDBService from './PDB';
import pvService from './pv';
import pvcService from './pvc';
import storageClassService from './storageClass';

import { 
    cicdService,
    quotaService,
    egressService,
    clusterService,
    securityService,
} from './clusterAbout';

import {
    repoService,
    repoTagService,
    repoScanService,
    jobService,
    targetService,
    policyService,
    memberService,
    hbProjectService,
    repoConfigService,
} from './repo';

import { 
    releaseService,
    versionService,
    chartService,
    helmMemberService,
    helmLogService,
} from './helm';

import {
    logService,
    HPAService,
} from './workload';

import {
    kubeconfigService,
    tenantQuotaService,
    ingressdomainsuffixService,
    calicoService,
} from './admin';

export {
    podService,
    serService,
    eventService,
    ingressService,
    namespaceService,
    deploymentService,
    secretService,
    monitorService,
    cephService,
    volumeService,
    nodeService,
    configmapService,
    statefulsetService,
    ingConService,
    PDBService,
    pvService,
    pvcService,
    storageClassService,

    cicdService,
    quotaService,
    egressService,
    clusterService,
    securityService,
    
    repoService,
    repoTagService,
    repoScanService,
    jobService,
    targetService,
    policyService,
    memberService,
    hbProjectService,
    repoConfigService,

    releaseService,
    versionService,
    chartService,
    helmMemberService,
    helmLogService,
    
    logService,
    HPAService,

    kubeconfigService,
    tenantQuotaService,
    ingressdomainsuffixService,
    calicoService,
};
