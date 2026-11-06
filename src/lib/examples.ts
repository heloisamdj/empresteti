// Referência visual de layout.md. Nunca é enviada a uma mutação.
export const examples = [
  {
    id: "ex-1",
    name: 'MacBook Pro 14"',
    patrimony: "PAT-1042",
    category: "NOTEBOOK",
    status: "AVAILABLE",
    borrowed: false,
  },
  {
    id: "ex-2",
    name: "ThinkPad T14",
    patrimony: "PAT-1188",
    category: "NOTEBOOK",
    status: "AVAILABLE",
    borrowed: true,
  },
  {
    id: "ex-3",
    name: 'Dell UltraSharp 27"',
    patrimony: "PAT-0871",
    category: "MONITOR",
    status: "AVAILABLE",
    borrowed: false,
  },
  {
    id: "ex-4",
    name: 'LG UltraFine 24"',
    patrimony: "PAT-0910",
    category: "MONITOR",
    status: "MAINTENANCE",
    borrowed: false,
  },
  {
    id: "ex-5",
    name: "Sony A7 III",
    patrimony: "PAT-0233",
    category: "CAMERA",
    status: "AVAILABLE",
    borrowed: true,
  },
  {
    id: "ex-6",
    name: "Dock USB-C Anker",
    patrimony: "PAT-0455",
    category: "ACCESSORY",
    status: "AVAILABLE",
    borrowed: false,
  },
] as const;
export const categoryIcon: Record<string, string> = {
  NOTEBOOK: "laptop",
  MONITOR: "monitor",
  CAMERA: "video-camera",
  ACCESSORY: "usb",
  CABLE: "usb",
  PROJECTOR: "projector-screen",
};
