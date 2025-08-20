import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';

/**
 * 获取设备信息（适用于 Capacitor 环境）
 */
async function getDeviceInfo() {
    const info = await Device.getInfo();

    return {
        model: info.model,            // 设备型号（如 "Pixel"）
        platform: info.platform,      // 平台（'ios', 'android', 'web'）
        osVersion: info.osVersion,    // 操作系统版本
        manufacturer: info.manufacturer, // 制造商（如 "Google"）
        deviceId: null,               // 将通过 Device.getId() 获取
    };
}

/**
 * 获取唯一设备 ID（优先 Capacitor getId，其次浏览器指纹）
 */
async function getDeviceId(): Promise<string> {
    if (Capacitor.isNativePlatform()) {
        const { identifier } = await Device.getId();
        return identifier;
    }

    // Web 环境下使用浏览器指纹生成唯一标识
    return generateBrowserFingerprint();
}

/**
 * 浏览器指纹生成函数（用于 Web 端替代 UUID）
 */
function generateBrowserFingerprint(): string {
    try {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (context) {
            context.textBaseline = 'top';
            context.font = '14px "Arial"';
            context.fillStyle = '#f00';
            context.fillRect(125, 1, 62, 20);
            context.fillStyle = '#00f';
            context.fillText('Cwm', 2, 2);
        }

        const canvasData = canvas.toDataURL();

        const fingerprint = JSON.stringify({
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screen: `${screen.width}x${screen.height}`,
            canvas: canvasData,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        });

        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
            const chr = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0;
        }
        return Math.abs(hash).toString(16);
    } catch (error) {
        console.warn('生成浏览器指纹失败:', error);
        return Math.random().toString(36).substr(2, 10); // 回退到简单随机字符串
    }
}

export default {
    getDeviceInfo,
    getDeviceId,
    generateBrowserFingerprint
};