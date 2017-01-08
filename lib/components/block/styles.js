import { getFontSizes } from '../../utils/config';
import objectAssign from 'object-assign';

export const styleTitle = () => {
  return {
    fontFamily: 'sangbleu-light',
    fontSize: getFontSizes().title,
    fill: 0x000000,
    align: 'left'
  }
}

export const styleTitleMobile = () => {
  return objectAssign({}, styleTitle, {
    fontSize: getFontSizes().titleMobile,
  });
};

export const styleInfo  = () => {
  return {
    fontFamily: 'sectra-book',
    fontSize: getFontSizes().info,
    fill: 0x000000,
    align: 'left'
  }
}

export const styleInfoMobile = () => {
  return objectAssign({}, styleInfo, {
    fontSize: getFontSizes().infoMobile,
  });
}

export const styleLink = () => {
  return {
    fontFamily: 'castledown-regular',
    fontSize: getFontSizes().link,
    fill: 0x000000,
    align: 'left'
  }
}

export const styleLinkMobile = () => {
  return objectAssign({}, styleLink, {
    fontSize: getFontSizes().linkMobile,
  });
}
