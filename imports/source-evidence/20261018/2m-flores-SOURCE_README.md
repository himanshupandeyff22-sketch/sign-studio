---
license: cc-by-sa-4.0
language:
- ase
task_categories:
- translation
- automatic-speech-recognition
tags:
- asl
- sign language
- american sign language
pretty_name: 2M-Flores - American Sign Language Flores
size_categories:
- 1K<n<10K
configs:
- config_name: default
  data_files:
    - split: dev
      path:
        - data/dev/metadata.csv
    - split: devtest
      path:
        - data/devtest/metadata.csv
features:
    - name: id
      dtype: int64
    - name: URL
      dtype: string
    - name: domain
      dtype: string
    - name: topic
      dtype: string
    - name: has_image
      dtype: int64
    - name: has_hyperlink
      dtype: int64
    - name: sentence
      dtype: string
    - name: gloss
      dtype: string
    - name: signer
      dtype: int64
---


# 2M-Flores

As part of the [2M-Belebele](https://github.com/facebookresearch/belebele) project, we have produced video recodings of ASL signing for all the `dev` and `devtest` 
sentences in the original [flores200](https://github.com/facebookresearch/flores/tree/main/flores200) dataset.

To obtain ASL sign recordings, we provide translators of ASL and native signers with the English text version of the sentences to be recorded.
The interpreters are then asked to translate these sentences into ASL, create glosses for all sentences, and record their interpretations into ASL one sentence at a time. 
The glosses are subjected to an additional quality check by expert annotators to harmonize the glossing format. To harmonize the recording conditions and eliminate visual bias, 
the videos are recorded against plain monochrome backgrounds (e.g., white or green), and signers are requested to wear monochrome upper body clothing (e.g., black). 
All videos are captured in 1920x1080p resolution with all of the signing space covered in FOV. The recordings are done in 60 frames per second to address most of the motion 
blur that happens during signing.

### Columns

- `id`: copied from flores
- `URL`: copied from flores
- `domain`: copied from flores
- `topic`: copied from flores
- `has_image`: copied from flores
- `has_hyperlink`: copied from flores
- `sentence`: copied from flores
- `gloss`: the gloss for the signed video
- `signer`: some sentences have multiple recordings, this is not a global id.

## Citation

If you use this data in your work, please cite the 2M-Belebele paper:

```bibtex
@article{2mbelebele,  
author =  {Marta R. Costa-jussà and Bokai Yu and Pierre Andrews and Belen Alastruey and Necati Cihan Camgoz and Joe Chuang and Jean Maillard and Christophe Ropers and Arina Turkantenko and Carleigh Wood},  
  journal = {Arxiv},  
 = {https://arxiv.org/abs/2412.08274},  
  title = {{2M-BELEBELE}: Highly-Multilingual Speech and American Sign Language  
Comprehension Dataset},  
  year = {2024},  
}
```

## License

2M-Flores is released under CC-BY-SA4.0, it is composed based on Flores200 (CC-BY-SA 4.0).