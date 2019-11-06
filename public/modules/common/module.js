import angular from 'angular';
import 'angular-toastr';

import DropdownComponent from './components/dropdown/DropdownComponent';
import LevelCircles from './components/levelCircles/LevelCircles';
import NotificationService from './services/NotificationService';
import FeatureFlagService from './services/featureFlagService';
import DynamicList from './components/dynamicList/DynamicList';
import ConfirmationModalDirective from './directives/confirmationModal/ConfirmationModalDirective';
import ConfirmationModalController from './directives/confirmationModal/ConfirmationModalController';

const CommonModule = angular.module('CommonModule', ['toastr'])

.service('FeatureFlagService', FeatureFlagService)
.service('NotificationService', NotificationService)
.component('dropdownComponent', DropdownComponent)
.component('levelCircles', LevelCircles)
.component('dynamicList', DynamicList)
.controller('ConfirmationModalController', ConfirmationModalController)
.directive('confirmationModal', () => new ConfirmationModalDirective());

export default CommonModule;
