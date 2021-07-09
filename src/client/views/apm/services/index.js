import apm from './apis/apm.js';
import rule from './apis/rule.js';
import Service from '@micro-app/common/services/service.js';

const apis = Object.assign(apm, rule);
const service = new Service(apis);

service.getTrans = (param) => {
    return service.trans(param).then((result) => {
        result = result.result;
        result.nodes = !result.vertices?[] : result.vertices.map((vertex) => {
            const text = (vertex.name || vertex.id) + '';
            return {
                id: vertex.id,
                status:0,
                stats:{
                    numberOfCalls: vertex.requestCount,
                    averageResponseTime: vertex.responseTime,
                    errorsPerMinute: 0.0,
                    callsPerMinute: 0.0,
                    numberOfErrors:vertex.errorCount,
                    errorRatio:0.0
                },
                backendType: vertex.category,
                name: vertex.id,
                entityType: 'BACKEND',
                nodeCount: 1,
                nodeId: vertex.nodeId,
                backendName: vertex.type,
                agentType: vertex.agentType,
                errorData: vertex.errorData,
            };
        });
        result.edges = !result.edges?[]:result.edges.map((edge) => {
            return {
                targetNode: result.nodes[edge.destination].id,
                stats: {
                    numberOfCalls: edge.requestCount,
                    averageResponseTime: edge.responseTime,
                    errorsPerMinute: 0.0,
                    callsPerMinute: edge.requestCount,
                    numberOfErrors: edge.errorCount,
                    errorRatio: 0.0
                },
                sourceNode: result.nodes[edge.source].id
            };
        });
        return result;
    })
}

export default service;
