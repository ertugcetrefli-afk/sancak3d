/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author jagenjo / http://twitter.com/jagenjo
 */

THREE.GLTFLoader = function ( manager ) {
    this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
};

THREE.GLTFLoader.prototype = {

    constructor: THREE.GLTFLoader,

    load: function ( url, onLoad, onProgress, onError ) {
        var scope = this;

        var loader = new THREE.FileLoader( scope.manager );
        loader.setResponseType( 'arraybuffer' );

        loader.load( url, function ( data ) {
            try {
                scope.parse( data, onLoad );
            } catch ( e ) {
                if ( onError ) { onError( e ); }
                else { throw e; }
            }
        }, onProgress, onError );
    },

    parse: function ( data, onLoad ) {
        var content;
        var magic = THREE.LoaderUtils.decodeText( new Uint8Array( data, 0, 4 ) );

        if ( magic === 'glTF' ) {
            content = this.parseBinary( data, onLoad );
        } else {
            content = JSON.parse( THREE.LoaderUtils.decodeText( new Uint8Array( data ) ) );
            this.parseJSON( content, onLoad );
        }
    },

    parseBinary: function ( data, onLoad ) {
        var headerView = new DataView( data, 0, 12 );
        var magic = headerView.getUint32( 0, true );
        if ( magic !== 0x46546C67 ) {
            throw new Error( 'GLTFLoader: Unsupported glTF-Binary header.' );
        }
        var length = headerView.getUint32( 8, true );
        var jsonChunkHeader = new DataView( data, 12, 8 );
        var chunkLength = jsonChunkHeader.getUint32( 0, true );
        var chunkType = jsonChunkHeader.getUint32( 4, true );

        if ( chunkType !== 0x4E4F534A ) {
            throw new Error( 'GLTFLoader: Unsupported glTF-Binary chunk type.' );
        }

        var jsonText = THREE.LoaderUtils.decodeText( new Uint8Array( data, 20, chunkLength ) );
        var json = JSON.parse( jsonText );
        this.parseJSON( json, onLoad );
    },

    parseJSON: function ( json, onLoad ) {
        var loader = new THREE.ObjectLoader();
        var scene = loader.parse( json );
        if ( onLoad ) onLoad( { scene: scene } );
    }

};
