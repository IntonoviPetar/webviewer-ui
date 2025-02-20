import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import StylePopup from 'components/StylePopup';

import core from 'core';
import getClassName from 'helpers/getClassName';
import setToolStyles from 'helpers/setToolStyles';
import { isMobile } from 'helpers/device';
import { mapAnnotationToKey } from 'constants/map';
import actions from 'actions';
import selectors from 'selectors';

import './AnnotationStylePopup.scss';

class AnnotationStylePopup extends React.Component {
  static propTypes = {
    isDisabled: PropTypes.bool,
    annotation: PropTypes.object.isRequired,
    style: PropTypes.object.isRequired,
    closeElement: PropTypes.func.isRequired,
  };

  handleSliderChange = (property, value) => {
    const { annotation } = this.props;
    const annotManager = core.getAnnotationManager();
    
    annotation[property] = value
    annotManager.redrawAnnotation(annotation)
  }
  
  handleStyleChange = (property, value) => {
    const { annotation } = this.props;

    core.setAnnotationStyles(annotation, {
      [property]: value,
    });

    setToolStyles(annotation.ToolName, property, value);
  };

  handleClick = e => {
    // see the comments above handleClick in ToolStylePopup.js
    if (isMobile() && e.target === e.currentTarget) {
      this.props.closeElement('annotationPopup');
    }
  }

  render() {
    const { isDisabled, annotation, style } = this.props;
    const isFreeText =
      annotation instanceof window.Annotations.FreeTextAnnotation &&
      annotation.getIntent() ===
        window.Annotations.FreeTextAnnotation.Intent.FreeText;
    const className = getClassName('Popup AnnotationStylePopup', this.props);
    const colorMapKey = mapAnnotationToKey(annotation);

    if (isDisabled) {
      return null;
    }

    return (
      <div
        className={className}
        data-element="annotationStylePopup"
        onClick={this.handleClick}
      >
        {/* Do not show checkbox for ellipse as snap mode does not exist for it */}
        <StylePopup
          hideSnapModeCheckbox={(annotation instanceof window.Annotations.EllipseAnnotation || !core.isFullPDFEnabled())}
          colorMapKey={colorMapKey}
          style={style}
          isFreeText={isFreeText}
          onStyleChange={this.handleStyleChange}
          onSliderChange={this.handleSliderChange}
          disableSeparator
        />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  isDisabled: selectors.isElementDisabled(state, 'annotationStylePopup'),
});

const mapDispatchToProps = {
  closeElement: actions.closeElement,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AnnotationStylePopup);
