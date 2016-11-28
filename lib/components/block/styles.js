import { getFontSizes } from '../../utils/config';

export const styleTitle = () => {
  return {
    fontFamily: 'SangBleu BP',
    fontSize: getFontSizes().title,
    fill: 0x000000,
    align: 'left'
  }
}

export const styleTitleMobile = () => {
  return Object.assign({}, styleTitle, {
    fontSize: getFontSizes().titleMobile,
  });
};

export const styleInfo  = () => {
  return {
    fontFamily: 'GT Sectra Trial',
    fontSize: getFontSizes().info,
    fill: 0x000000,
    align: 'left'
  }
}

export const styleInfoMobile = () => {
  return Object.assign({}, styleInfo, {
    fontSize: getFontSizes().infoMobile,
  });
}

export const styleLink = () => {
  return {
    fontFamily: 'Castledown',
    fontSize: getFontSizes().link,
    fill: 0x000000,
    align: 'left'
  }
}

export const styleLinkMobile = () => {
  return Object.assign({}, styleLink, {
    fontSize: getFontSizes().linkMobile,
  });
}
