/**
 * Created by FDD on 2017/12/28.
 * @desc 标绘画圆算法
 * @Inherits maptalks.Circle
 */

import * as maptalks from 'maptalks'
const Coordinate = maptalks.Coordinate
class PlotCircle extends maptalks.Circle {
  constructor (coordinate, radius, points, options = {}) {
    super(null, options)
    this.type = 'PlotCircle'
    this._points = points || []
    if (coordinate) {
      this.setCoordinates(coordinate)
    }
    this._radius = radius
  }

  /**
   * 获取geom类型
   * @returns {string}
   */
  getPlotType () {
    return this.type
  }

  /**
   * 更新控制点
   * @param coordinates
   */
  setPoints (coordinates) {
    this._points = !coordinates ? [] : [coordinates[0], coordinates[coordinates.length - 1]]
    const map = this.getMap()
    const radius = map.computeLength(this.getCenter(), coordinates[coordinates.length - 1])
    this.setRadius(radius)
  }

  /**
   * 获取控制点
   * @returns {Array|*}
   */
  getPoints () {
    return this._points
  }

  _exportGeoJSONGeometry () {
    const coordinates = Coordinate.toNumberArrays([this.getShell()])
    return {
      'type': 'Polygon',
      'coordinates': coordinates
    }
  }

  _toJSON (options) {
    const center = this.getCenter()
    const opts = maptalks.Util.extend({}, options)
    opts.geometry = false
    const feature = this.toGeoJSON(opts)
    feature['geometry'] = {
      'type': 'Polygon'
    }
    return {
      'feature': feature,
      'subType': 'PlotCircle',
      'coordinates': [center.x, center.y],
      'radius': this.getRadius(),
      'points': this.getPoints()
    }
  }

  static fromJSON (json) {
    const GeoJSON = json['feature']
    const feature = new PlotCircle(json['coordinates'], json['radius'], json['points'], json['options'])
    feature.setProperties(GeoJSON['properties'])
    return feature
  }
}

PlotCircle.registerJSONType('PlotCircle')

export default PlotCircle
