import React from 'react';
import {Engine, Scene, MeshBuilder, Color3, ArcRotateCamera, Vector3, HemisphericLight, PointLight} from '@babylonjs/core';

export class PlanetRender extends React.Component {
    componentDidMount() {
        this.updateCanvas()
    }

    updateCanvas() {
        var engine = new Engine(this.refs.canvas, true);
        var scene = new Scene(engine);

        // Add lights to the scene
        var light1 = new HemisphericLight("light1", new Vector3(1, 1, 0), scene);
        var light2 = new PointLight("light2", new Vector3(0, 1, -1), scene);

        var camera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 10, new Vector3(0,0,0), scene);
        camera.attachControl(this.refs.canvas, true);

        var sphere = MeshBuilder.CreateSphere("sphere", {diameter: 2}, scene);

        engine.runRenderLoop(() => {
            console.log("Render")
            scene.render();
        })
    }

    render() {
        return (
            <canvas ref="canvas" width={300} height={300}/>
        );
    }
}