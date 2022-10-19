import React, { useCallback, useMemo } from 'react';
import { filter, map, partition } from 'lodash';
import { useSelector } from 'react-redux';
import { c, t } from 'ttag';

import {
  CUSTOM,
  GUIDED_CAMPAIGNS,
  TDE,
  TDEA,
  TDEB,
  GOB,
  CampaignCycleCode,
  DARK_MATTER,
  ALICE_IN_WONDERLAND,
  CROWN_OF_EGIL,
  CALL_OF_THE_PLAGUEBEARER,
  CYCLOPEAN_FOUNDATIONS,
  EOE,
} from '@actions/types';
import CycleItem from './CycleItem';
import { campaignDescription, campaignName } from '../constants';
import { getPacksInCollection } from '@reducers';
import CardDetailSectionHeader from '@components/card/CardDetailView/CardDetailSectionHeader';
import { useSettingValue } from '@components/core/hooks';

export interface SelectCampagaignProps {
  campaigns: CampaignCycleCode[];
  campaignChanged: (packCode: CampaignCycleCode, text: string, hasGuide: boolean) => void;
  segment?: boolean;
  includeCustom?: boolean;
}


export default function CampaignTab({ campaignChanged, campaigns, segment, includeCustom }: SelectCampagaignProps) {
  const in_collection = useSelector(getPacksInCollection);
  const ignore_collection = useSettingValue('ignore_collection');

  const onPress = useCallback((campaignCode: CampaignCycleCode, text: string) => {
    campaignChanged(campaignCode, text, GUIDED_CAMPAIGNS.has(campaignCode));
  }, [campaignChanged]);

  const renderCampaign = useCallback((packCode: CampaignCycleCode) => {
    const guideComingSoon = (packCode !== CUSTOM && !GUIDED_CAMPAIGNS.has(packCode));
    return (
      <CycleItem
        key={packCode}
        packCode={packCode}
        onPress={onPress}
        text={campaignName(packCode) || c('campaign').t`Custom`}
        description={guideComingSoon ? t`Guide not yet available` : campaignDescription(packCode)}
      />
    );
  }, [onPress]);

  const [myCampaigns, otherCampaigns] = useMemo(() => {
    if (!segment) {
      return [campaigns, []];
    }
    return partition(
      campaigns,
      pack_code => (ignore_collection || in_collection[pack_code] || (pack_code === 'core' && !in_collection.no_core) || (
        in_collection.tde && (pack_code === TDEA || pack_code === TDEB || pack_code === TDE) ||
        (in_collection.eoec && pack_code === EOE)))
    );
  }, [segment, campaigns, in_collection, ignore_collection]);
  return (
    <>
      { !!segment && myCampaigns.length > 0 && (
        <CardDetailSectionHeader normalCase color="dark" title={t`My Campaigns` } />
      ) }
      { map(myCampaigns, pack_code => renderCampaign(pack_code)) }
      { includeCustom && renderCampaign(CUSTOM) }
      { !!segment && otherCampaigns.length > 0 && (
        <CardDetailSectionHeader normalCase color="dark" title={t`Other Campaigns`} />
      ) }
      { map(otherCampaigns, pack_code => renderCampaign(pack_code)) }
    </>
  );
}
