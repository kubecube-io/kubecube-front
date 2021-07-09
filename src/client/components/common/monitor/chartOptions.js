import { sizeProcessor } from './filters';

export const POD_CHART_OPTIONS = [
    {
        name: 'cpu_usage_percentage',
        unit: '%',
        title: 'CPU使用率',
    },
    {
        name: 'memory_usage_bytes',
        unit: 'B',
        title: '内存使用量',
        processor: sizeProcessor,
    },
    {
        name: 'disk_read_operation_rate',
        unit: '次/s',
        title: '磁盘读操作速率',
        hasDevice: true,
    },
    {
        name: 'disk_read_bytes_rate',
        unit: 'B/s',
        title: '磁盘读字节速率',
        hasDevice: true,
        processor: sizeProcessor,
    },
    {
        name: 'disk_write_operation_rate',
        unit: '次/s',
        title: '磁盘写操作速率',
        hasDevice: true,
    },
    {
        name: 'disk_write_bytes_rate',
        unit: 'B/s',
        title: '磁盘写字节速率',
        hasDevice: true,
        processor: sizeProcessor,
    },
    {
        name: 'network_receive_bytes_rate',
        unit: 'B/s',
        title: '网络带宽-流入',
        hasInterface: true,
        processor: sizeProcessor,
    },
    {
        name: 'network_receive_packets_rate',
        unit: 'pps',
        hasInterface: true,
        title: '网络收包速率',
    },
    {
        name: 'network_transmit_bytes_rate',
        unit: 'B/s',
        title: '网络带宽-流出',
        hasInterface: true,
        processor: sizeProcessor,
    },
    {
        name: 'network_transmit_packets_rate',
        unit: 'pps',
        title: '网络发包速率',
        hasInterface: true,
    },
];

export const NODE_CHART_OPTIONS = [
    {
        name: 'cpu_usage_percentage',
        unit: '%',
        title: 'CPU使用率',
    },
    {
        name: 'memory_usage_bytes',
        unit: 'B',
        title: '内存使用量',
    },
    {
        name: 'disk_usage_percentage',
        unit: '%',
        title: '文件系统使用率',
        hasDevice: true,
    },
    {
        name: 'disk_read_operation_rate',
        unit: '次/s',
        title: '磁盘读操作速率',
        hasDevice: true,
    },
    {
        name: 'disk_read_bytes_rate',
        unit: 'B/s',
        title: '磁盘读字节速率',
        hasDevice: true,
    },
    {
        name: 'disk_write_operation_rate',
        unit: '次/s',
        title: '磁盘写操作速率',
        hasDevice: true,
    },
    {
        name: 'disk_write_bytes_rate',
        unit: 'B/s',
        title: '磁盘写字节速率',
        hasDevice: true,
    },
];

export const CLUSTER_CHART_OPTIONS = [
    {
        name: 'cpu_idle_mode_percentage',
        unit: '%',
        title: 'Idle CPU',
    },
    {
        name: 'system_load',
        unit: '',
        keys: [ 'load1', 'load5', 'load15' ], // 对应和后端约定的key
        title: 'System Load',
    },
    {
        name: 'memory_usage_bytes',
        unit: 'B',
        title: 'Memory Used',
    },
    {
        name: 'memory_free_bytes',
        unit: 'B',
        title: 'Memory Free',
    },
    {
        name: 'memory_cached_bytes',
        unit: 'B',
        title: 'Memory Cached',
    },
    {
        name: 'memory_buffer_bytes',
        unit: 'B',
        title: 'Memory Buffers',
    },
    {
        name: 'disk_read_write_bytes_rate', 
        unit: 'B/s',
        keys: ['read', 'write'],
        title: 'Disk I/O Throughout',
    },
    {
        name: 'disk_read_write_operation_rate', 
        unit: '次/s',
        keys: ['read', 'write'],
        title: 'Disk IOPS',
    },
    {
        name: 'disk_io_time',
        unit: '%',
        title: 'Disk I/O iotime',
    },
    {
        name: 'network_receive_transmit_bytes_rate',
        unit: 'B/s',
        keys: ['receive', 'transmit'],
        title: 'Network Throughout',
    },
    {
        name: 'network_receive_transmit_packets_rate',
        unit: 'pps',
        keys: ['receive', 'transmit'],
        title: 'Network PPS',
    },
    {
        name: 'pod_num_info',
        unit: '个',
        keys: [ 
            { text: '最大可用副本数', value: 'available' },
            { text: '已用副本数', value: 'used' },
        ],
        title: '集群副本数',
    },
];