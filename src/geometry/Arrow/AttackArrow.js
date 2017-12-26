/**
 * Created by FDD on 2017/12/26.
 * @desc 进攻方向
 * @Inherits maptalks.Polygon
 */

import * as maptalks from 'maptalks'
import * as Constants from '../../Constants'
import {
  Mid,
  getThirdPoint,
  MathDistance,
  getBaseLength,
  wholeDistance,
  isClockWise,
  getQBSplinePoints,
  getAngleOfThreePoints
} from '../helper/index'
const Coordinate = maptalks.Coordinate

class AttackArrow extends maptalks.Polygon {
  constructor (coordinates, options = {}) {
    super(options)
    this.type = 'AttackArrow'
    this._coordinates = []
    this.headHeightFactor = 0.18
    this.headWidthFactor = 0.3
    this.neckHeightFactor = 0.85
    this.neckWidthFactor = 0.15
    this.headTailFactor = 0.8
    if (coordinates) {
      this.setPoints(coordinates)
    }
  }

  /**
   * 处理插值
   */
  _generate () {
    try {
      const count = this._coordinates.length
      if (count < 2) return
      if (count === 2) {
        this.setCoordinates([this._coordinates])
      } else {
        let pnts = Coordinate.toNumberArrays(this._coordinates)
        let [tailLeft, tailRight] = [pnts[0], pnts[1]]
        if (isClockWise(pnts[0], pnts[1], pnts[2])) {
          tailLeft = pnts[1]
          tailRight = pnts[0]
        }
        let midTail = Mid(tailLeft, tailRight)
        let bonePnts = [midTail].concat(pnts.slice(2))
        let headPnts = this._getArrowHeadPoints(bonePnts, tailLeft, tailRight)
        let [neckLeft, neckRight] = [headPnts[0], headPnts[4]]
        let tailWidthFactor = MathDistance(tailLeft, tailRight) / getBaseLength(bonePnts)
        let bodyPnts = this._getArrowBodyPoints(bonePnts, neckLeft, neckRight, tailWidthFactor)
        let count = bodyPnts.length
        let leftPnts = [tailLeft].concat(bodyPnts.slice(0, count / 2))
        leftPnts.push(neckLeft)
        let rightPnts = [tailRight].concat(bodyPnts.slice(count / 2, count))
        rightPnts.push(neckRight)
        leftPnts = getQBSplinePoints(leftPnts)
        rightPnts = getQBSplinePoints(rightPnts)
        this.setCoordinates([
          Coordinate.toCoordinates(leftPnts.concat(headPnts, rightPnts.reverse()))
        ])
      }
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 插值头部点
   * @param points
   * @param tailLeft
   * @param tailRight
   * @returns {*[]}
   */
  _getArrowHeadPoints (points, tailLeft, tailRight) {
    let len = getBaseLength(points)
    let headHeight = len * this.headHeightFactor
    let headPnt = points[points.length - 1]
    len = MathDistance(headPnt, points[points.length - 2])
    let tailWidth = MathDistance(tailLeft, tailRight)
    if (headHeight > tailWidth * this.headTailFactor) {
      headHeight = tailWidth * this.headTailFactor
    }
    let headWidth = headHeight * this.headWidthFactor
    let neckWidth = headHeight * this.neckWidthFactor
    headHeight = headHeight > len ? len : headHeight
    let neckHeight = headHeight * this.neckHeightFactor
    let headEndPnt = getThirdPoint(points[points.length - 2], headPnt, 0, headHeight, true)
    let neckEndPnt = getThirdPoint(points[points.length - 2], headPnt, 0, neckHeight, true)
    let headLeft = getThirdPoint(headPnt, headEndPnt, Constants.HALF_PI, headWidth, false)
    let headRight = getThirdPoint(headPnt, headEndPnt, Constants.HALF_PI, headWidth, true)
    let neckLeft = getThirdPoint(headPnt, neckEndPnt, Constants.HALF_PI, neckWidth, false)
    let neckRight = getThirdPoint(headPnt, neckEndPnt, Constants.HALF_PI, neckWidth, true)
    return [neckLeft, headLeft, headPnt, headRight, neckRight]
  }

  /**
   * 插值面部分数据
   * @param points
   * @param neckLeft
   * @param neckRight
   * @param tailWidthFactor
   * @returns {*|T[]|string}
   */
  _getArrowBodyPoints (points, neckLeft, neckRight, tailWidthFactor) {
    let allLen = wholeDistance(points)
    let len = getBaseLength(points)
    let tailWidth = len * tailWidthFactor
    let neckWidth = MathDistance(neckLeft, neckRight)
    let widthDif = (tailWidth - neckWidth) / 2
    let [tempLen, leftBodyPnts, rightBodyPnts] = [0, [], []]
    for (let i = 1; i < points.length - 1; i++) {
      let angle = getAngleOfThreePoints(points[i - 1], points[i], points[i + 1]) / 2
      tempLen += MathDistance(points[i - 1], points[i])
      let w = (tailWidth / 2 - tempLen / allLen * widthDif) / Math.sin(angle)
      let left = getThirdPoint(points[i - 1], points[i], Math.PI - angle, w, true)
      let right = getThirdPoint(points[i - 1], points[i], angle, w, false)
      leftBodyPnts.push(left)
      rightBodyPnts.push(right)
    }
    return leftBodyPnts.concat(rightBodyPnts)
  }

  setPoints (coordinates) {
    this._coordinates = !coordinates ? [] : coordinates
    if (this._coordinates.length >= 1) {
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
    return {
      'feature': this.toGeoJSON(options),
      'subType': 'AttackArrow'
    }
  }

  static fromJSON (json) {
    const feature = json['feature']
    const attackArrow = new AttackArrow(json['coordinates'], json['width'], json['height'], json['options'])
    attackArrow.setProperties(feature['properties'])
    return attackArrow
  }
}

AttackArrow.registerJSONType('AttackArrow')

export default AttackArrow