import Service from '@micro-app/common/services/service.js';
const model = {
    "apiVersion": "networking.k8s.io/v1",
    "kind": "NetworkPolicy",
    "metadata": {
        "name": "test-network-policy",
        "namespace": "default"
    },
    "spec": {
        "podSelector": {
            "matchLabels": {
                "role": "db"
            }
        },
        "policyTypes": [
            "Ingress",
            "Egress"
        ],
        "ingress": [{
            "from": [{
                    "ipBlock": {
                        "cidr": "172.17.0.0/16",
                        "except": [
                            "172.17.1.0/24"
                        ]
                    }
                },
                {
                    "namespaceSelector": {
                        "matchLabels": {
                            "project": "myproject"
                        }
                    }
                },
                {
                    "podSelector": {
                        "matchLabels": {
                            "role": "frontend"
                        }
                    }
                }
            ],
            "ports": [{
                "protocol": "TCP",
                "port": 6379
            }]
        }],
        "egress": [{
            "to": [{
                "ipBlock": {
                    "cidr": "10.0.0.0/24"
                }
            }],
            "ports": [{
                "protocol": "TCP",
                "port": 5978
            }]
        }]
    }
};


const apis = {
    load: {
        method: 'get',
        path: '/{clusterId}/namespaces/{nsName}/calico/networkpolicies/{name}',
        mock: model,
    },
    create: {
        method: 'post',
        path: '/{clusterId}/namespaces/{nsName}/calico/networkpolicies',
    },
    modify: {
        method: 'put',
        path: '/{clusterId}/namespaces/{nsName}/calico/networkpolicies/{name}',
    },
    delete: {
        method: 'delete',
        path: '/{clusterId}/namespaces/{nsName}/calico/networkpolicies/{name}',
    },
    loads: {
        method: 'get',
        path: '/{clusterId}/calico/networkpolicies',
        mock: [model],
    },
};

const service = new Service(apis, '/ncs/proxy/api/v1/ncs/extends/clusters');

export default service;
