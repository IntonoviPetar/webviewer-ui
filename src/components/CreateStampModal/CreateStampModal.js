import React, { useState } from 'react';
import classNames from 'classnames';
import { useSelector, useDispatch } from 'react-redux';
import core from 'core';
import actions from 'actions';
import selectors from 'selectors';
import { useTranslation } from 'react-i18next';
// import ActionButton from 'components/ActionButton'; /* Temporarily commented out */
import CustomStampForums from './CustomStampForums';

import './CreateStampModal.scss';

const TOOL_NAME = 'AnnotationCreateRubberStamp';

const CustomStampModal = () => {
  const [state, setState] = useState({});
  const stampTool = core.getTool(TOOL_NAME);
  const [t] = useTranslation();
  const [isOpen] = useSelector(state => [
    selectors.isElementOpen(state, 'customStampModal'),
  ]);
  const dispatch = useDispatch();
  const closeModal = () => {
    dispatch(actions.closeElement('customStampModal'));
  };


  const modalClass = classNames({
    Modal: true,
    CustomStampModal: true,
    open: isOpen,
    closed: !isOpen,
  });

  const createDynamicStamp = () => {
    core.setToolMode(TOOL_NAME);
    stampTool.addCustomStamp(state);
    const annot = stampTool.createCustomStampAnnotation(state);
    stampTool.setRubberStamp(annot);
    stampTool.showPreview();
    dispatch(actions.closeElement('customStampModal'));
    const standardStampCount = stampTool.getStandardStamps().length;
    const dynamicStampCount = stampTool.getCustomStamps().length;
    dispatch(actions.setSelectedStampIndex(standardStampCount + dynamicStampCount - 1));
  };

  return (
    <div
      className={modalClass}
      data-element="customStampModal"
      onMouseDown={closeModal}
    >
      <div className="container" onMouseDown={e => e.stopPropagation()}>
        <div className="header">
          <p style={{ textAlign: 'center' }}>{t(`component.createStampButton`)}</p>
          {/* Temporarily commented out */}
          {/* <ActionButton
            dataElement="customStampModalCloseButton"
            title="action.close"
            img="ic_close_black_24px"
            onClick={closeModal}
          /> */}
        </div>
        <CustomStampForums
          isModalOpen={isOpen}
          state={state}
          setState={setState}
          closeModal={closeModal}
          createDynamicStamp={createDynamicStamp}
        />
      </div>
    </div>
  );
};

export default CustomStampModal;
