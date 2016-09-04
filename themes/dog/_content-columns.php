<?php
require_once(realpath(dirname(__FILE__)) . '/_block-direct-access.php');
get_header();
?><div class="w-container main-container">
	<div class="breadcrumbs"></div>
	<div class="content-columns">
		<?php if (DOG__SIDEBAR_ON_LEFT) {
			dog__include_template('sidebar');
		} ?>
		<div class="content-column main"<?php if ($tpl_data['itemlist']) { ?> itemscope itemtype="http://schema.org/ItemList"<?php } ?>><?php
			dog__include_template($tpl_data['template']);
		?></div>
		<?php if (!DOG__SIDEBAR_ON_LEFT) {
			dog__include_template('sidebar');
		} ?>
	</div>
</div><?php
get_footer();