# 🎨 3D Model Dönüştürücü ve Görüntüleyici

Web tabanlı 3D model dönüştürme ve görüntüleme sistemi. Müşterileriniz çeşitli 3D formatlarını GLB'ye dönüştürebilir ve kendi web sitelerinde sergileyebilir.

## ✨ Özellikler

- 🔄 **Çoklu Format Desteği**: OBJ, FBX, STL, PLY, DAE (Collada), GLTF, GLB
- 🎯 **Otomatik Dönüştürme**: Yüklediğiniz her dosya otomatik olarak GLB formatına dönüştürülür
- 👁️ **Gerçek Zamanlı Önizleme**: 3D modelinizi hemen görüntüleyin
- 💾 **İndirme**: Dönüştürülmüş GLB dosyasını indirin
- 🔗 **Embed Kodu**: Kendi web sitenize entegre etmek için hazır kod
- 📱 **Responsive**: Mobil ve masaüstü uyumlu
- 🖱️ **İnteraktif Kontroller**: Fare ile döndürme, yakınlaştırma, kaydırma

## 🚀 Kurulum

### 1. Gereksinimler

- Modern bir web tarayıcısı (Chrome, Firefox, Safari, Edge)
- Bir web sunucusu (local veya online)

### 2. Dosyaları Kopyalayın

```bash
git clone [repo-url]
cd sancak3d
```

### 3. Web Sunucusu ile Çalıştırın

**Python ile:**
```bash
python -m http.server 8000
```

**Node.js ile:**
```bash
npx http-server -p 8000
```

**PHP ile:**
```bash
php -S localhost:8000
```

Ardından tarayıcınızda `http://localhost:8000` adresini açın.

## 📖 Kullanım

### Ana Dönüştürücü Arayüzü (index.html)

1. **Dosya Yükleme:**
   - "Dosya Seç" butonuna tıklayın
   - Veya dosyayı sürükleyip bırakın

2. **Desteklenen Formatlar:**
   - OBJ, FBX, STL, PLY, DAE, GLTF, GLB

3. **Dönüştürme:**
   - Dosya otomatik olarak yüklenip GLB'ye dönüştürülür
   - 3D görüntüleyicide model gösterilir

4. **İndirme:**
   - "GLB İndir" butonuyla dönüştürülmüş dosyayı indirin

5. **Embed Kodu:**
   - "Embed Kodu Al" ile sitenize entegre etmek için hazır kod alın

### Görüntüleyici Sayfası (viewer.html)

Müşterilerinizin kendi sitelerinde kullanabilecekleri basit bir görüntüleyici:

```html
<!-- Sitenize ekleyin -->
<iframe src="viewer.html" width="100%" height="700px"></iframe>
```

## 🎮 Kontroller

- **Fare Sol Tuş + Sürükle**: Modeli döndür
- **Fare Tekerleği**: Yakınlaş/Uzaklaş
- **Fare Sağ Tuş + Sürükle**: Kamerayı kaydır
- **Otomatik Dönüş**: Modeli sürekli döndür

## 📁 Dosya Yapısı

```
sancak3d/
├── index.html          # Ana dönüştürücü arayüzü
├── viewer.html         # Basit görüntüleyici sayfası
├── app.js              # Ana uygulama mantığı
├── converter.js        # 3D format dönüştürücü
├── GLTFLoader.js       # GLTF/GLB yükleyici
├── OrbitControls.js    # Kamera kontrolleri
├── three.min.js        # Three.js kütüphanesi
└── *.glb               # Örnek 3D modeller
```

## 🔧 Özelleştirme

### Renk Teması Değiştirme

`index.html` içindeki CSS'i düzenleyin:

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Varsayılan Kamera Konumu

`app.js` içinde:

```javascript
this.camera.position.set(0, 5, 10); // x, y, z
```

### Model Boyutu

`converter.js` içinde `centerAndScaleModel` fonksiyonunu düzenleyin:

```javascript
const scale = 5 / maxDim; // 5'i değiştirin
```

## 🌐 Sitenize Entegre Etme

### Basit Embed

```html
<!DOCTYPE html>
<html>
<head>
    <title>3D Model</title>
</head>
<body>
    <div id="model-viewer" style="width: 100%; height: 600px;"></div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r159/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.159.0/examples/js/controls/OrbitControls.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.159.0/examples/js/loaders/GLTFLoader.js"></script>

    <script>
        // Scene oluştur
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 5, 10);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('model-viewer').appendChild(renderer.domElement);

        const controls = new THREE.OrbitControls(camera, renderer.domElement);

        // Işık ekle
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 10, 7.5);
        scene.add(light);

        // Model yükle
        const loader = new THREE.GLTFLoader();
        loader.load('your-model.glb', function(gltf) {
            scene.add(gltf.scene);
        });

        // Render loop
        function animate() {
            requestAnimationFrame(animate);
            controls.update();
            renderer.render(scene, camera);
        }
        animate();
    </script>
</body>
</html>
```

## 🐛 Sorun Giderme

### Model Yüklenmiyor

- Dosya formatının desteklendiğinden emin olun
- Dosya boyutunun çok büyük olmadığını kontrol edin
- Konsol loglarına bakın (F12)

### Model Görünmüyor

- Kamera mesafesini ayarlayın
- Model ölçeğinin uygun olduğundan emin olun
- Işıkların açık olduğunu kontrol edin

### Dönüştürme Hatası

- Dosyanın bozuk olmadığından emin olun
- Farklı bir format deneyin
- Konsol loglarına bakın

## 📚 Teknolojiler

- **Three.js**: 3D grafik kütüphanesi
- **WebGL**: Donanım hızlandırmalı 3D rendering
- **JavaScript ES6+**: Modern JavaScript
- **HTML5 & CSS3**: Modern web standartları

## 📝 Lisans

MIT License - Ticari kullanım için serbesttir.

## 🤝 Destek

Sorularınız için:
- GitHub Issues
- Email: support@example.com

## 🎯 Gelecek Özellikler

- [ ] Texture düzenleme
- [ ] Animasyon desteği
- [ ] Batch dönüştürme
- [ ] Cloud storage entegrasyonu
- [ ] Model optimizasyonu
- [ ] AR (Augmented Reality) desteği

---

**Made with ❤️ for 3D enthusiasts**
