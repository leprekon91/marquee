import { SettingKey } from '../types/settings';
import { getCategoryById } from './categoryService';
import { getPerformerById, getPerformersByCategoryId } from './performerService';
import { getCurrentSettings, setSetting } from './settingsService';

export function getDisplaySettings() {
  const currentSettings = getCurrentSettings().reduce(
    (acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    },
    {} as Record<string, string>,
  );

  const settings = {
    bgColor: currentSettings[SettingKey.BG_COLOR],
    textColor: currentSettings[SettingKey.TEXT_COLOR],
    fontSize: currentSettings[SettingKey.FONT_SIZE],
    fontFamily: currentSettings[SettingKey.FONT_FAMILY],
    displayType: currentSettings[SettingKey.CURRENT_DISPLAY],
  };

  switch (settings.displayType) {
    case 'performer':
      const performerId = currentSettings[SettingKey.CURRENT_PERFORMER];
      const categoryId = currentSettings[SettingKey.CURRENT_CATEGORY];

      const performer = getPerformerById(performerId);
      if (!performer) {
        throw new Error('Performer not found');
      }

      const category = getCategoryById(categoryId);
      if (!category) {
        throw new Error('Category not found');
      }

      return {
        performer,
        category,
        settings,
      };
    default:
    case 'title':
      const title = currentSettings[SettingKey.TITLE];
      const subtitle = currentSettings[SettingKey.SUBTITLE];

      return {
        title,
        subtitle,
        settings,
      };
  }
}

// set the next performer to be displayed
export function setNextPerformer() {
  const currentSettings = getCurrentSettings().reduce(
    (acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    },
    {} as Record<string, string>,
  );

  const performerId = currentSettings[SettingKey.CURRENT_PERFORMER];
  const categoryId = currentSettings[SettingKey.CURRENT_CATEGORY];

  const category = getCategoryById(categoryId);
  if (!category) {
    throw new Error('Category not found');
  }

  const performers = getPerformersByCategoryId(categoryId);
  const currentPerformer = performers.find((performer) => performer.id === performerId);

  if (!currentPerformer) {
    throw new Error('Current performer not found');
  }

  const nextPerformer = performers.find(
    (performer) => performer.order === (parseInt(currentPerformer?.order || '0') + 1).toString(),
  );

  if (!nextPerformer) {
    throw new Error('No next performer found');
  }

  return {
    performer: nextPerformer,
    category,
  };
}

export function setCurrentPerformer(performerId: string) {
  const performer = getPerformerById(performerId);
  if (!performer) {
    throw new Error('Performer not found');
  }
  const category = getCategoryById(performer.category_id);
  if (!category) {
    throw new Error('Category not found');
  }

  setSetting(SettingKey.CURRENT_PERFORMER, performer.id);
  setSetting(SettingKey.CURRENT_CATEGORY, performer.category_id);
}

// set the category to be displayed
export function setCategory(categoryId: string) {
  const category = getCategoryById(categoryId);
  if (!category) {
    throw new Error('Category not found');
  }

  const performers = getPerformersByCategoryId(categoryId);
  if (performers.length === 0) {
    throw new Error('No performers found in this category');
  }
  const firstPerformer = performers.sort((a, b) => parseInt(a.order) - parseInt(b.order))[0];

  setSetting(SettingKey.CURRENT_CATEGORY, categoryId);
  setSetting(SettingKey.CURRENT_PERFORMER, firstPerformer.id);
}

// switch the display type
export function switchDisplayType(displayType: 'performer' | 'title') {
  if (displayType !== 'performer' && displayType !== 'title') {
    throw new Error('Invalid display type');
  }

  setSetting(SettingKey.CURRENT_DISPLAY, displayType);
}
