declare module 'leaflet' {
    interface HeatLayerOptions extends LayerOptions {
        radius?: number
        blur?: number
        maxZoom?: number
        max?: number
        minOpacity?: number
        gradient?: Record<number, string>
    }

    interface HeatLayer extends Layer {
        setLatLngs(latlngs: Array<LatLngExpression | [number, number, number]>): this
        addLatLng(latlng: LatLngExpression | [number, number, number]): this
        setOptions(options: HeatLayerOptions): this
        redraw(): this
    }

    function heatLayer(
        latlngs: Array<LatLngExpression | [number, number, number]>,
        options?: HeatLayerOptions
    ): HeatLayer
}
