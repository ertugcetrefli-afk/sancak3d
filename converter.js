// 3D Model Converter - Farklı formatları GLB'ye çevirir
class ModelConverter {
    constructor() {
        this.scene = null;
        this.loadedModel = null;
        this.loadersReady = false;
        this.loaderScripts = {
            obj: 'https://cdn.jsdelivr.net/npm/three@0.159.0/examples/js/loaders/OBJLoader.js',
            fbx: 'https://cdn.jsdelivr.net/npm/three@0.159.0/examples/js/loaders/FBXLoader.js',
            stl: 'https://cdn.jsdelivr.net/npm/three@0.159.0/examples/js/loaders/STLLoader.js',
            ply: 'https://cdn.jsdelivr.net/npm/three@0.159.0/examples/js/loaders/PLYLoader.js',
            dae: 'https://cdn.jsdelivr.net/npm/three@0.159.0/examples/js/loaders/ColladaLoader.js',
            exporter: 'https://cdn.jsdelivr.net/npm/three@0.159.0/examples/js/exporters/GLTFExporter.js'
        };
    }

    // Script yükleme fonksiyonu
    loadScript(url) {
        return new Promise((resolve, reject) => {
            // Zaten yüklü mü kontrol et
            const existingScript = document.querySelector(`script[src="${url}"]`);
            if (existingScript) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = url;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Script yüklenemedi: ${url}`));
            document.head.appendChild(script);
        });
    }

    // Dosya formatını belirle
    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }

    // Gerekli loaderi yükle
    async loadRequiredLoader(format) {
        const loaderMap = {
            'obj': 'obj',
            'fbx': 'fbx',
            'stl': 'stl',
            'ply': 'ply',
            'dae': 'dae'
        };

        const loaderKey = loaderMap[format];
        if (loaderKey && this.loaderScripts[loaderKey]) {
            await this.loadScript(this.loaderScripts[loaderKey]);
        }

        // Exporter'ı her zaman yükle
        if (!window.THREE.GLTFExporter) {
            await this.loadScript(this.loaderScripts.exporter);
        }
    }

    // Dosyayı yükle
    async loadFile(file, onProgress) {
        const format = this.getFileExtension(file.name);

        // Gerekli loaderi yükle
        await this.loadRequiredLoader(format);

        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = async (e) => {
                try {
                    const contents = e.target.result;
                    let model;

                    switch(format) {
                        case 'obj':
                            model = await this.loadOBJ(contents);
                            break;
                        case 'fbx':
                            model = await this.loadFBX(contents);
                            break;
                        case 'stl':
                            model = await this.loadSTL(contents);
                            break;
                        case 'ply':
                            model = await this.loadPLY(contents);
                            break;
                        case 'dae':
                            model = await this.loadDAE(contents);
                            break;
                        case 'gltf':
                        case 'glb':
                            model = await this.loadGLTF(contents);
                            break;
                        default:
                            throw new Error(`Desteklenmeyen format: ${format}`);
                    }

                    this.loadedModel = model;
                    resolve(model);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Dosya okunamadı'));

            // Binary veya text olarak oku
            if (['fbx', 'stl', 'glb'].includes(format)) {
                reader.readAsArrayBuffer(file);
            } else {
                reader.readAsText(file);
            }
        });
    }

    // OBJ yükle
    async loadOBJ(contents) {
        const loader = new THREE.OBJLoader();
        const object = loader.parse(contents);
        return object;
    }

    // FBX yükle
    async loadFBX(arrayBuffer) {
        const loader = new THREE.FBXLoader();
        const object = loader.parse(arrayBuffer);
        return object;
    }

    // STL yükle
    async loadSTL(arrayBuffer) {
        const loader = new THREE.STLLoader();
        const geometry = loader.parse(arrayBuffer);
        const material = new THREE.MeshStandardMaterial({
            color: 0x888888,
            metalness: 0.3,
            roughness: 0.6
        });
        const mesh = new THREE.Mesh(geometry, material);
        return mesh;
    }

    // PLY yükle
    async loadPLY(arrayBuffer) {
        const loader = new THREE.PLYLoader();
        const geometry = loader.parse(arrayBuffer);
        const material = new THREE.MeshStandardMaterial({
            color: 0x888888,
            vertexColors: geometry.hasAttribute('color')
        });
        const mesh = new THREE.Mesh(geometry, material);
        return mesh;
    }

    // DAE (Collada) yükle
    async loadDAE(contents) {
        const loader = new THREE.ColladaLoader();
        const collada = loader.parse(contents);
        return collada.scene;
    }

    // GLTF/GLB yükle
    async loadGLTF(contents) {
        return new Promise((resolve, reject) => {
            const loader = new THREE.GLTFLoader();

            if (typeof contents === 'string') {
                // GLTF text
                loader.parse(contents, '', (gltf) => {
                    resolve(gltf.scene);
                }, reject);
            } else {
                // GLB binary
                const dataView = new DataView(contents);
                loader.parse(contents, '', (gltf) => {
                    resolve(gltf.scene);
                }, reject);
            }
        });
    }

    // GLB'ye dönüştür
    async convertToGLB(model) {
        return new Promise((resolve, reject) => {
            const exporter = new THREE.GLTFExporter();

            const options = {
                binary: true,
                maxTextureSize: 4096,
                embedImages: true
            };

            exporter.parse(
                model,
                (result) => {
                    if (result instanceof ArrayBuffer) {
                        resolve(result);
                    } else {
                        reject(new Error('Dönüştürme başarısız'));
                    }
                },
                (error) => {
                    reject(error);
                },
                options
            );
        });
    }

    // Model bilgilerini al
    getModelInfo(model) {
        const info = {
            vertices: 0,
            triangles: 0,
            materials: 0,
            textures: 0
        };

        model.traverse((child) => {
            if (child.isMesh) {
                if (child.geometry) {
                    const geometry = child.geometry;
                    if (geometry.attributes.position) {
                        info.vertices += geometry.attributes.position.count;
                    }
                    if (geometry.index) {
                        info.triangles += geometry.index.count / 3;
                    } else if (geometry.attributes.position) {
                        info.triangles += geometry.attributes.position.count / 3;
                    }
                }
                if (child.material) {
                    info.materials++;
                    if (child.material.map) info.textures++;
                }
            }
        });

        return info;
    }

    // Model merkezi ve boyutunu hesapla
    centerAndScaleModel(model) {
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Modeli merkeze al
        model.position.x = -center.x;
        model.position.y = -center.y;
        model.position.z = -center.z;

        // Modeli ölçeklendir (en büyük boyut 5 birim olsun)
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 5 / maxDim;
        model.scale.set(scale, scale, scale);

        return { center, size, scale };
    }
}

// Global instance
const modelConverter = new ModelConverter();
