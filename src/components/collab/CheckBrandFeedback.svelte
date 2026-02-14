
<script>
    import { t } from '$lib/i18n-helper.ts';
    import FeedbackVideo from './FeedbackVideo.svelte';
    let { feedback, onFinalUpload, draftContent } = $props();
    let showTranslated = $state(false);

    const handleFinalUpload = () => {
        console.log('final upload');
        onFinalUpload?.();
    };

    const handleToggleTranslate = () => {
        showTranslated = !showTranslated;
    };
</script>

<div class="reviewfeedback">
    <h1 class="reviewfeedback-title">{t('collab.reviewfeedback_title')}</h1>
    <p class="reviewfeedback-description">{t('collab.reviewfeedback_description')}</p>
  <div class="reviewfeedback-content">
    <div class="reviewfeedback-video-container">
        <FeedbackVideo src={draftContent.files[0].file_url} transcript={draftContent.files[0].translated_transcription}/>
        <div class="reviewfeedback-header  ">
            <h2 class="reviewfeedback-header-item">{draftContent.influencer_name}</h2>
            <h2 class="reviewfeedback-header-item">{draftContent.brand_name}</h2>
            <span class="reviewfeedback-header-item-separator">/</span>
            <h2 class="reviewfeedback-header-item">{draftContent.product_name}</h2>
            <span class="reviewfeedback-header-item-separator">/</span>
            <h2 class="reviewfeedback-header-item">초안</h2>
            </div>
    
        <div class="reviewfeedback-date">
            <h2>{t('collab.reviewfeedback_date')}:</h2>
            <p>{draftContent.delivery_deadline}</p>
        </div>
       </div>
        <div class="reviewfeedback-data">
            <div class="reviewfeedback-data-title-container"><h1 class="reviewfeedback-data-title">{t('collab.reviewfeedback_data_title')}</h1><button type="button" class="reviewfeedback-data-translate-button" onclick={handleToggleTranslate}>{showTranslated ? t('collab.reviewfeedback_original_text') : t('collab.reviewfeedback_translate')}</button>
            </div>
          {#if !feedback[0].timestamp_start && !feedback[0].timestamp_end}
        <div class="reviewfeedback-data-no-time-feedback">
            <h2>{t('collab.reviewfeedback_no_time_feedback')}</h2>
            <p>{showTranslated ? feedback[0].translated_feedback : feedback[0].feedback_text}</p>
        </div>
       
        {/if}
            <div class="reviewfeedback-data-items">
         
               {#if feedback[0].timestamp_start && feedback[0].timestamp_end}
                  {#each feedback as item}
                    <div class="reviewfeedback-data-item">
                        <h2>{item.timestamp_start} ~ {item.timestamp_end}</h2>
                        <p>{showTranslated ? item.translated_feedback : item.feedback_text}</p>
                    </div>
                  {/each}
                {/if}
            </div>
        </div>
  </div>
    <button class="reviewfeedback-final-upload-button" onclick={handleFinalUpload}>{t('collab.reviewfeedback_final_upload_button')}</button>
     
</div>


<style lang="scss">

  .reviewfeedback{
    padding: 0 20px;
    margin-bottom: 20px;
  }
    
    
    .reviewfeedback-video-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
     
        width: 100%;
    }

    .reviewfeedback-title {
        @include text-heading-1-semibold;
    }

    .reviewfeedback-description {
        @include text-caption-0-semibold;
    }

    .reviewfeedback-header {
        display: flex;
        align-self: flex-start;
        gap: 5px;
        @include text-headline-1-semibold;
     
    }
  

    .reviewfeedback-date{
        display: flex;
        @include text-caption-0-semibold;
        align-self: flex-start;
        color: $gray-800;
      
        

    }

    .reviewfeedback-data{
        display: flex;
        flex-direction: column;
      
        justify-content: center;
      
        box-sizing: border-box;
    }

    .reviewfeedback-data-title-container{
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    
        .reviewfeedback-data-title{
            @include text-heading-1-semibold;
        }

        .reviewfeedback-data-translate-button{
            @include text-body-0-semibold;
            padding: 8px 36px;
            border-radius: 10px;
            border: 1px solid $gray-400;
            background-color: inherit;
            cursor: pointer;
        }
    }

    .reviewfeedback-data-no-time-feedback{
        display: flex;
        flex-direction: column;
        gap: 10px;
        h2{
            @include text-headline-0-semibold;
        }
        p{
            @include text-body-0-semibold;
            background-color: $gray-200;
            padding: 12px 24px;
            border-radius: 10px;
            min-height: 150px;
        }
    }

    .reviewfeedback-data-items{
        display: flex;
        flex-direction: column;
        gap: 10px;

        .reviewfeedback-data-item{
          h2{
            @include text-headline-0-semibold;
          }
          p{
            background-color: $gray-200;
            padding: 12px 24px; 
            @include text-body-0-semibold;
            border-radius: 10px;
          }
        }
   
       
    }

    .reviewfeedback-final-upload-button{
        @include main-button('primary');
        width: 100%;
        margin-top: 20px;
        max-width: 400px;
        margin-top: 30px;
    }

    @include tablet-up {

        .reviewfeedback{
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .reviewfeedback-title{
            @include text-title-0-extrabold;
            align-self: flex-start;

        }

        .reviewfeedback-description{
            @include text-headline-0-semibold;
            align-self: flex-start;
        }

        .reviewfeedback-content{
            display: flex;
            flex-direction: row;
            justify-content: flex-start;
            align-items: flex-start;
            gap: 20px;
            max-width: 1000px;
            width: 100%;
            margin-top: 20px;
            overflow-y: scroll;
            -ms-overflow-style: none;
            scrollbar-width: none;
            &::-webkit-scrollbar { display: none; }
            .reviewfeedback-video-container {
                width: 400px;
                flex:1
            }

            .reviewfeedback-data{
                width: 100%;
                flex:1;
            }
        }

        .reviewfeedback-header {
            @include text-title-2-semibold;
        }

        .reviewfeedback-date {
            @include text-headline-0-medium;
        }

        .reviewfeedback-video-container {
         width: 400px;
        }
    }



</style>