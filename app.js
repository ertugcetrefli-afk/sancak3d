// Ana Uygulama
class App {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.currentModel = null;
        this.glbData = null;
        this.animationId = null;

        this.init();
        this.setupEventListeners();
    }

    init() {
        // Three.js scene kurulumu
        this.setupScene();
    }

    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            45,
            1,
            0.1,
            1000
        );
        this.camera.position.set(0, 5, 10);

        // Renderer
        const container = document.getElementById('viewer-container');
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.updateRendererSize();

        // Kontrolleri daha sonra ekle (container'a renderer eklendikten sonra)
    }

    updateRendererSize() {
        const container = document.getElementById('viewer-container');
        if (container) {
            const width = container.clientWidth;
            const height = container.clientHeight;

            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        }
    }

    setupLights() {
        // Mevcut ışıkları temizle
        const lights = this.scene.children.filter(child => child.isLight);
        lights.forEach(light => this.scene.remove(light));

        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Directional lights
        const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight1.position.set(5, 10, 7.5);
        this.scene.add(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
        dirLight2.position.set(-5, 10, -7.5);
        this.scene.add(dirLight2);

        // Hemisphere light
        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3);
        hemiLight.position.set(0, 20, 0);
        this.scene.add(hemiLight);
    }

    setupEventListeners() {
        // Dosya input
        const fileInput = document.getElementById('fileInput');
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Drag & Drop
        const uploadArea = document.getElementById('uploadArea');

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.processFile(files[0]);
            }
        });

        // Butonlar
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadGLB());
        document.getElementById('embedBtn').addEventListener('click', () => this.showEmbedCode());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());

        // Pencere boyutu değişimi
        window.addEventListener('resize', () => this.updateRendererSize());
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    async processFile(file) {
        this.showStatus('Dosya yükleniyor...', 'info');

        try {
            // Modeli yükle
            const model = await modelConverter.loadFile(file);

            this.showStatus('Model GLB formatına dönüştürülüyor...', 'info');

            // Modeli merkeze al ve ölçeklendir
            modelConverter.centerAndScaleModel(model);

            // Mevcut modeli kaldır
            if (this.currentModel) {
                this.scene.remove(this.currentModel);
            }

            // Yeni modeli ekle
            this.currentModel = model;
            this.scene.add(model);

            // GLB'ye dönüştür
            this.glbData = await modelConverter.convertToGLB(model);

            // Viewer'ı göster
            this.showViewer();

            // Model bilgilerini göster
            this.showModelInfo(model);

            this.showStatus('✓ Model başarıyla yüklendi ve GLB formatına dönüştürüldü!', 'success');

        } catch (error) {
            console.error('Hata:', error);
            this.showStatus('✗ Hata: ' + error.message, 'error');
        }
    }

    showViewer() {
        const viewerSection = document.getElementById('viewerSection');
        viewerSection.classList.add('active');

        // Renderer'ı container'a ekle
        const container = document.getElementById('viewer-container');
        container.innerHTML = '';
        container.appendChild(this.renderer.domElement);

        // Boyutu güncelle
        this.updateRendererSize();

        // Controls'ü ayarla
        if (!this.controls) {
            this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.05;
            this.controls.screenSpacePanning = false;
            this.controls.minDistance = 1;
            this.controls.maxDistance = 50;
        }

        // Işıkları ayarla
        this.setupLights();

        // Animasyonu başlat
        this.startAnimation();

        // Scroll to viewer
        viewerSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    startAnimation() {
        // Önceki animasyonu durdur
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        const animate = () => {
            this.animationId = requestAnimationFrame(animate);

            if (this.controls) {
                this.controls.update();
            }

            this.renderer.render(this.scene, this.camera);
        };

        animate();
    }

    showModelInfo(model) {
        const info = modelConverter.getModelInfo(model);
        const infoBox = document.getElementById('modelInfo');
        const infoContent = document.getElementById('infoContent');

        const glbSize = (this.glbData.byteLength / 1024).toFixed(2);

        infoContent.innerHTML = `
            <div class="info-item">
                <span class="info-label">Köşe Sayısı:</span>
                <span class="info-value">${info.vertices.toLocaleString()}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Üçgen Sayısı:</span>
                <span class="info-value">${Math.floor(info.triangles).toLocaleString()}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Materyal Sayısı:</span>
                <span class="info-value">${info.materials}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Doku Sayısı:</span>
                <span class="info-value">${info.textures}</span>
            </div>
            <div class="info-item">
                <span class="info-label">GLB Boyutu:</span>
                <span class="info-value">${glbSize} KB</span>
            </div>
        `;

        infoBox.style.display = 'block';
    }

    showStatus(message, type) {
        const statusDiv = document.getElementById('statusMessage');
        statusDiv.className = `status-message status-${type}`;
        statusDiv.textContent = message;
        statusDiv.style.display = 'block';

        if (type === 'success' || type === 'error') {
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 5000);
        }
    }

    downloadGLB() {
        if (!this.glbData) {
            alert('Henüz dönüştürülmüş bir model yok!');
            return;
        }

        const blob = new Blob([this.glbData], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'model-' + Date.now() + '.glb';
        link.click();
        URL.revokeObjectURL(url);

        this.showStatus('✓ GLB dosyası indirildi!', 'success');
    }

    showEmbedCode() {
        const embedSection = document.getElementById('embedSection');
        const embedCode = document.getElementById('embedCode');

        // Örnek embed kodu
        const code = `<!-- 3D Model Viewer -->
<div id="model-viewer" style="width: 100%; height: 600px;"></div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r159/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.159.0/examples/js/controls/OrbitControls.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.159.0/examples/js/loaders/GLTFLoader.js"></script>

<script>
// Scene kurulum
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf0f0f0);

const container = document.getElementById('model-viewer');
const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Işıklar
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 7.5);
scene.add(dirLight);

// Model yükle (model.glb dosyanızın yolunu buraya yazın)
const loader = new THREE.GLTFLoader();
loader.load('model.glb', function(gltf) {
    scene.add(gltf.scene);
});

// Animasyon
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Responsive
window.addEventListener('resize', function() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});
</script>`;

        embedCode.textContent = code;
        embedSection.style.display = 'block';

        // Scroll to embed section
        embedSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    reset() {
        // Modeli kaldır
        if (this.currentModel) {
            this.scene.remove(this.currentModel);
            this.currentModel = null;
        }

        // Verileri temizle
        this.glbData = null;

        // Viewer'ı gizle
        const viewerSection = document.getElementById('viewerSection');
        viewerSection.classList.remove('active');

        // Animasyonu durdur
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        // Input'u temizle
        document.getElementById('fileInput').value = '';

        // Status mesajını temizle
        document.getElementById('statusMessage').style.display = 'none';

        // Embed section'ı gizle
        document.getElementById('embedSection').style.display = 'none';

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Embed kod kopyalama fonksiyonu
function copyEmbedCode() {
    const embedCode = document.getElementById('embedCode');
    const text = embedCode.textContent;

    navigator.clipboard.writeText(text).then(() => {
        alert('Embed kodu kopyalandı!');
    }).catch(err => {
        console.error('Kopyalama hatası:', err);
    });
}

// Uygulamayı başlat
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
});
