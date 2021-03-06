/**
 * Created by FDD on 2017/12/31.
 * @desc 粗单直箭头
 * @Inherits maptalks.Polygon
 */

import * as maptalks from 'maptalks'
import * as Constants from '../../Constants'
import {
  getThirdPoint,
  getBaseLength
} from '../helper/index'
const Coordinate = maptalks.Coordinate

const _options = {
  tailWidthFactor: 0.05,
  headWidthFactor: 0.15,
  neckWidthFactor: 0.1,
  headAngle: Math.PI / 4,
  neckAngle: Math.PI * 0.17741
}

class AssaultDirection extends maptalks.Polygon {
  constructor (coordinates, points, options = {}) {
    super(options)
    this.type = 'AssaultDirection'
    this._coordinates = []
    this._points = points || []
    if (coordinates) {
      this.setCoordinates(coordinates)
    }
  }

  /**
   * 处理插值
   */
  _generate () {
    try {
      const count = this._points.length
      const _points = Coordinate.toNumberArrays(this._points)
      if (count < 2) return
      let [points1, points2] = [_points[0], _points[1]]
      let len = getBaseLength(_points)
      let tailWidth = len * _options.tailWidthFactor
      let neckWidth = len * _options.neckWidthFactor
      let headWidth = len * _options.headWidthFactor
      let tailLeft = getThirdPoint(points2, points1, Constants.HALF_PI, tailWidth, true)
      let tailRight = getThirdPoint(points2, points1, Constants.HALF_PI, tailWidth, false)
      let headLeft = getThirdPoint(points1, points2, _options.headAngle, headWidth, false)
      let headRight = getThirdPoint(points1, points2, _options.headAngle, headWidth, true)
      let neckLeft = getThirdPoint(points1, points2, _options.neckAngle, neckWidth, false)
      let neckRight = getThirdPoint(points1, points2, _options.neckAngle, neckWidth, true)
      let pList = [tailLeft, neckLeft, headLeft, points2, headRight, neckRight, tailRight]
      this.setCoordinates([
        Coordinate.toCoordinates(pList)
      ])
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 获取geom类型
   * @returns {string}
   */
  getPlotType () {
    return this.type
  }

  /**
   * 获取控制点
   * @returns {Array|*}
   */
  getPoints () {
    return this._points
  }

  /**
   * set point
   * @param coordinates
   */
  setPoints (coordinates) {
    this._points = !coordinates ? [] : coordinates
    if (this._points.length >= 1) {
      this._generate()
    }
  }

  _exportGeoJSONGeometry () {
    const coordinates = Coordinate.toNumberArrays([this.getShell()])
    return {
      'type': 'Polygon',
      'coordinates': coordinates
    }
  }

  _toJSON (options) {
    const opts = maptalks.Util.extend({}, options)
    const coordinates = this.getCoordinates()
    opts.geometry = false
    const feature = this.toGeoJSON(opts)
    feature['geometry'] = {
      'type': 'Polygon'
    }
    return {
      'feature': feature,
      'subType': 'AssaultDirection',
      'coordinates': coordinates,
      'points': this.getPoints()
    }
  }

  static fromJSON (json) {
    const feature = json['feature']
    const assaultDirection = new AssaultDirection(json['coordinates'], json['points'], json['options'])
    assaultDirection.setProperties(feature['properties'])
    return assaultDirection
  }
}

AssaultDirection.registerJSONType('AssaultDirection')

export default AssaultDirection
