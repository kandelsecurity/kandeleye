// src/lib/integration/aggregator.ts
// Agregador de datos de todas las herramientas KANDEL
// Recibe datos de KANDELscan, KANDELcrack, KANDELlimiter, KANDELker
// y los expone como capas unificadas en KANDELeye

export interface KANDELToolData {
  timestamp: number;
  source: 'kandelscan' | 'kandelcrack' | 'kandellimiter' | 'kandelker';
  type: string;
  data: Record<string, unknown>;
}

export interface VulnerabilityPoint {
  id: string;
  target: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  cve?: string;
  port?: number;
  service?: string;
  timestamp: number;
}

export interface WiFiNetwork {
  id: string;
  bssid: string;
  ssid?: string;
  channel: number;
  encryption: string;
  signal: number;
  frequency: number;
  timestamp: number;
}

export interface NetworkDevice {
  id: string;
  ip: string;
  mac: string;
  hostname?: string;
  limit?: number;
  status: 'active' | 'limited' | 'blocked';
  timestamp: number;
}

export interface GPSPoint {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  speed?: number;
  heading?: number;
  timestamp: number;
}

export interface IntegrationState {
  vulnerabilities: VulnerabilityPoint[];
  wifiNetworks: WiFiNetwork[];
  networkDevices: NetworkDevice[];
  gpsPoints: GPSPoint[];
}

class IntegrationAggregator {
  private static instance: IntegrationAggregator;
  private state: IntegrationState = {
    vulnerabilities: [],
    wifiNetworks: [],
    networkDevices: [],
    gpsPoints: [],
  };

  private constructor() {}

  static getInstance(): IntegrationAggregator {
    if (!IntegrationAggregator.instance) {
      IntegrationAggregator.instance = new IntegrationAggregator();
    }
    return IntegrationAggregator.instance;
  }

  addVulnerability(vuln: Omit<VulnerabilityPoint, 'id' | 'timestamp'>) {
    const point: VulnerabilityPoint = {
      ...vuln,
      id: `vuln-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    this.state.vulnerabilities.push(point);
    return point;
  }

  addWiFiNetwork(network: Omit<WiFiNetwork, 'id' | 'timestamp'>) {
    const net: WiFiNetwork = {
      ...network,
      id: `wifi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    this.state.wifiNetworks.push(net);
    return net;
  }

  addNetworkDevice(device: Omit<NetworkDevice, 'id' | 'timestamp'>) {
    const dev: NetworkDevice = {
      ...device,
      id: `dev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    this.state.networkDevices.push(dev);
    return dev;
  }

  addGPSPoint(point: Omit<GPSPoint, 'id' | 'timestamp'>) {
    const gps: GPSPoint = {
      ...point,
      id: `gps-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    this.state.gpsPoints.push(gps);
    return gps;
  }

  getState(): IntegrationState {
    return { ...this.state };
  }

  getVulnerabilities(): VulnerabilityPoint[] {
    return [...this.state.vulnerabilities];
  }

  getWiFiNetworks(): WiFiNetwork[] {
    return [...this.state.wifiNetworks];
  }

  getNetworkDevices(): NetworkDevice[] {
    return [...this.state.networkDevices];
  }

  getGPSPoints(): GPSPoint[] {
    return [...this.state.gpsPoints];
  }

  clearVulnerabilities() {
    this.state.vulnerabilities = [];
  }

  clearWiFiNetworks() {
    this.state.wifiNetworks = [];
  }

  clearNetworkDevices() {
    this.state.networkDevices = [];
  }

  clearGPSPoints() {
    this.state.gpsPoints = [];
  }

  clearAll() {
    this.state.vulnerabilities = [];
    this.state.wifiNetworks = [];
    this.state.networkDevices = [];
    this.state.gpsPoints = [];
  }

  getSummary() {
    return {
      totalVulnerabilities: this.state.vulnerabilities.length,
      criticalVulnerabilities: this.state.vulnerabilities.filter(v => v.severity === 'critical').length,
      highVulnerabilities: this.state.vulnerabilities.filter(v => v.severity === 'high').length,
      totalWiFiNetworks: this.state.wifiNetworks.length,
      totalNetworkDevices: this.state.networkDevices.length,
      activeDevices: this.state.networkDevices.filter(d => d.status === 'active').length,
      totalGPSPoints: this.state.gpsPoints.length,
      lastUpdate: Date.now(),
    };
  }
}

export const integrationAggregator = IntegrationAggregator.getInstance();
